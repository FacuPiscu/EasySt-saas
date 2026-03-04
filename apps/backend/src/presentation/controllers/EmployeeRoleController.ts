import { Response } from 'express';
import { prisma } from '../../infrastructure/database/prismaClient';
import { AuthenticatedRequest } from '../middlewares/AuthMiddleware';

export class EmployeeRoleController {
    static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const tenantId = req.user?.tenantId;
            const { name, functions, systemRole } = req.body;

            if (!tenantId) {
                res.status(401).json({ error: 'Falta información de Tenant' });
                return;
            }

            const newRole = await prisma.employeeRole.create({
                data: {
                    name,
                    functions,
                    systemRole: systemRole === 'NONE' ? null : (systemRole || null),
                    tenantId: tenantId
                }
            });

            res.status(201).json(newRole);
        } catch (error: any) {
            console.error('Error al crear el rol:', error);
            res.status(500).json({ error: 'Error interno al crear el rol de empleado' });
        }
    }

    static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const tenantId = req.user?.tenantId;

            if (!tenantId) {
                res.status(401).json({ error: 'Falta información de Tenant' });
                return;
            }

            const roles = await prisma.employeeRole.findMany({
                where: { tenantId },
                orderBy: { name: 'asc' }
            });

            res.status(200).json(roles);
        } catch (error: any) {
            console.error('Error al obtener los roles:', error);
            res.status(500).json({ error: 'Error interno al obtener roles' });
        }
    }
}
