import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";
import { z } from "zod";
import { prisma } from '../../infrastructure/database/prismaClient';
import { CryptoService } from '../../infrastructure/services/CryptoService';

const cryptoService = new CryptoService();

// --- Validadores Zod ---
const createEmployeeSchema = z.object({
    firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
    lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres."),
    document: z.string().min(1, "El documento es obligatorio."),
    employeeRoleId: z.string().uuid("El ID del rol de empleado debe ser un UUID válido.").optional().nullable(),
    shiftStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "El formato de hora de inicio debe ser HH:MM."),
    shiftEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "El formato de hora de fin debe ser HH:MM."),
    hasSystemAccess: z.boolean(),
    email: z.string().email("Debe ser un correo electrónico válido.").optional(),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.").optional(),
}).refine(data => {
    if (data.hasSystemAccess && (!data.email || !data.password)) {
        return false;
    }
    return true;
}, {
    message: "Email y contraseña son obligatorios si 'hasSystemAccess' es verdadero.",
    path: ["email", "password"]
});

const updateEmployeeSchema = z.object({
    firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres.").optional(),
    lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres.").optional(),
    document: z.string().min(1, "El documento es obligatorio.").optional(),
    employeeRoleId: z.string().uuid("El ID del rol de empleado debe ser un UUID válido.").optional().nullable(),
    shiftStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "El formato de hora de inicio debe ser HH:MM.").optional(),
    shiftEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "El formato de hora de fin debe ser HH:MM.").optional(),
    hasSystemAccess: z.boolean().optional(),
    email: z.string().email("Debe ser un correo electrónico válido.").optional(),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres.").optional(),
}).refine(data => {
    if (data.hasSystemAccess === true && !data.email) {
        return false;
    }
    return true;
}, {
    message: "Email es obligatorio si 'hasSystemAccess' es verdadero.",
    path: ["email"]
});


export class EmployeeController {

    static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const tenantId = req.user?.tenantId;

            if (!tenantId) {
                res.status(401).json({ error: 'Falta información de Tenant' });
                return;
            }

            const validationResult = createEmployeeSchema.safeParse(req.body);
            if (!validationResult.success) {
                res.status(400).json({
                    error: "Errores de validación.",
                    details: validationResult.error.issues
                });
                return;
            }

            const { firstName, lastName, document, employeeRoleId, shiftStart, shiftEnd, hasSystemAccess, email, password } = validationResult.data;

            let newUserId = null;

            if (hasSystemAccess && email && password) {
                const hashedPassword = await cryptoService.hash(password);

                let systemRole: "ADMIN" | "CASHIER" = 'CASHIER';
                if (employeeRoleId) {
                    const roleData = await prisma.employeeRole.findUnique({ where: { id: employeeRoleId } });
                    if (roleData && roleData.systemRole) {
                        systemRole = roleData.systemRole as any;
                    }
                }

                const newUser = await prisma.user.create({
                    data: {
                        email,
                        name: `${firstName} ${lastName}`,
                        passwordHash: hashedPassword,
                        role: systemRole,
                        tenantId: tenantId
                    }
                });
                newUserId = newUser.id;
            }

            const newEmployee = await prisma.employee.create({
                data: {
                    firstName,
                    lastName,
                    document,
                    employeeRoleId: employeeRoleId || null,
                    shiftStart,
                    shiftEnd,
                    tenantId: tenantId,
                    userId: newUserId
                }
            });

            res.status(201).json(newEmployee);
        } catch (error: any) {
            console.error('Error al crear empleado:', error);
            res.status(500).json({ error: 'Error interno al crear el empleado' });
        }
    }

    static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const tenantId = req.user?.tenantId;

            if (!tenantId) {
                res.status(401).json({ error: 'Falta información de Tenant' });
                return;
            }

            // This method should not have body validation for creation.
            // The original getAll logic is restored.
            const employees = await prisma.employee.findMany({
                where: { tenantId },
                include: { user: true, role: true },
                orderBy: { createdAt: 'desc' }
            });

            res.status(200).json(employees);
        } catch (error: any) {
            console.error('Error al obtener empleados:', error);
            res.status(500).json({ error: 'Error interno al obtener los empleados' });
        }
    }

    static async update(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const tenantId = req.user?.tenantId;
            const { id } = req.params;
            const { firstName, lastName, document, employeeRoleId, shiftStart, shiftEnd, hasSystemAccess, email, password } = req.body;

            if (!tenantId) {
                res.status(401).json({ error: 'Falta información de Tenant' });
                return;
            }

            // Buscar empleado existente
            const existingEmployee = await prisma.employee.findFirst({
                where: { id, tenantId },
                include: { user: true }
            });

            if (!existingEmployee) {
                res.status(404).json({ error: 'Empleado no encontrado' });
                return;
            }

            let currentUserId = existingEmployee.userId;

            // Determinar si debemos actualizar, crear o eliminar el usuario del sistema
            if (hasSystemAccess && email) {
                // Si el empleado tiene un rol asignado, buscamos qué permiso de sistema darle
                let systemRole: "ADMIN" | "CASHIER" = 'CASHIER';
                if (employeeRoleId) {
                    const roleData = await prisma.employeeRole.findUnique({ where: { id: employeeRoleId } });
                    if (roleData && roleData.systemRole) {
                        systemRole = roleData.systemRole;
                    }
                }

                if (currentUserId) {
                    // Update existing user
                    const updateData: any = {
                        email,
                        name: `${firstName} ${lastName}`,
                        role: systemRole
                    };

                    if (password) {
                        updateData.passwordHash = await cryptoService.hash(password);
                    }

                    await prisma.user.update({
                        where: { id: currentUserId },
                        data: updateData
                    });
                } else {
                    // Create new user for existing employee
                    if (!password) {
                        res.status(400).json({ error: 'Se requiere contraseña para crear un nuevo acceso al sistema' });
                        return;
                    }

                    const hashedPassword = await cryptoService.hash(password);
                    const newUser = await prisma.user.create({
                        data: {
                            email,
                            name: `${firstName} ${lastName}`,
                            passwordHash: hashedPassword,
                            role: systemRole,
                            tenantId: tenantId
                        }
                    });
                    currentUserId = newUser.id;
                }
            } else if (!hasSystemAccess && currentUserId) {
                // Delete existing user if access is revoked
                await prisma.user.delete({ where: { id: currentUserId } });
                currentUserId = null;
            }

            // Actualizar empleado
            const updatedEmployee = await prisma.employee.update({
                where: { id },
                data: {
                    firstName,
                    lastName,
                    document,
                    employeeRoleId: employeeRoleId || null,
                    shiftStart,
                    shiftEnd,
                    userId: currentUserId
                }
            });

            res.status(200).json(updatedEmployee);
        } catch (error: any) {
            console.error('Error al actualizar empleado:', error);
            res.status(500).json({ error: 'Error interno al actualizar el empleado' });
        }
    }

    static async delete(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const tenantId = req.user?.tenantId;
            const { id } = req.params;

            if (!tenantId) {
                res.status(401).json({ error: 'Falta información de Tenant' });
                return;
            }

            const existingEmployee = await prisma.employee.findFirst({
                where: { id, tenantId }
            });

            if (!existingEmployee) {
                res.status(404).json({ error: 'Empleado no encontrado' });
                return;
            }

            // Si tiene usuario asociado, lo borramos también (opcional o requerido dependiendo del negocio, aquí lo borramos para limpieza)
            if (existingEmployee.userId) {
                await prisma.user.delete({ where: { id: existingEmployee.userId } });
            }

            await prisma.employee.delete({
                where: { id }
            });

            res.status(200).json({ message: 'Empleado eliminado correctamente' });
        } catch (error: any) {
            console.error('Error al eliminar empleado:', error);
            res.status(500).json({ error: 'Error interno al eliminar el empleado' });
        }
    }

    static async toggleClock(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const tenantId = req.user?.tenantId;
            const { id } = req.params;

            if (!tenantId) {
                res.status(401).json({ error: 'Falta información de Tenant' });
                return;
            }

            const existingEmployee = await prisma.employee.findFirst({
                where: { id, tenantId }
            });

            if (!existingEmployee) {
                res.status(404).json({ error: 'Empleado no encontrado' });
                return;
            }

            const isNowClockedIn = !existingEmployee.isClockedIn;

            const updatedEmployee = await prisma.employee.update({
                where: { id },
                data: {
                    isClockedIn: isNowClockedIn,
                    lastClockIn: isNowClockedIn ? new Date() : existingEmployee.lastClockIn // Only update lastClockIn when clocking IN
                }
            });

            res.status(200).json({
                message: isNowClockedIn ? 'Entrada registrada' : 'Salida registrada',
                employee: updatedEmployee
            });
        } catch (error: any) {
            console.error('Error al cambiar asistencia:', error);
            res.status(500).json({ error: 'Error interno al procesar asistencia' });
        }
    }
}