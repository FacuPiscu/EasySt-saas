import { Request, Response } from "express";
import { RegisterTenantUseCase } from "../../application/use-cases/RegisterTenantUseCase";
import { RegisterTenantDTO } from "../../application/dtos/RegisterTenantDTO";

export class TenantController {
    constructor(private readonly registerTenantUseCase: RegisterTenantUseCase) { }

    public async registerTenant(req: Request, res: Response): Promise<void> {
        try {
            const { tenantName, adminName, adminEmail, adminPassword } = req.body;

            if (!tenantName || !adminName || !adminEmail || !adminPassword) {
                res.status(400).json({ error: "Faltan datos requeridos para registrar el negocio." });
                return;
            }

            const dto: RegisterTenantDTO = {
                tenantName: String(tenantName),
                adminName: String(adminName),
                adminEmail: String(adminEmail),
                adminPassword: String(adminPassword)
            };

            // Si funciona correctamente devuelve el ID del nuevo Tenant
            const result = await this.registerTenantUseCase.execute(dto);

            res.status(201).json({
                message: "Negocio y Administrador creados con éxito.",
                ...result
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || "Ocurrió un error inesperado al registrar el negocio." });
        }
    }
}
