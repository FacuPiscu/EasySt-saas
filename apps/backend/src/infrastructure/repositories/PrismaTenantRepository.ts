import { ITenantRepository } from "../../domain/repositories/ITenantRepository";
import { Tenant } from "../../domain/entities/Tenant";
import { prisma } from "../database/prismaClient";

export class PrismaTenantRepository implements ITenantRepository {
    public async findById(id: string): Promise<Tenant | null> {
        const data = await prisma.tenant.findUnique({
            where: { id },
        });

        if (!data) return null;

        return Tenant.create(
            data.id,
            data.name,
            data.plan,
            data.isActive,
            data.createdAt,
            data.updatedAt
        );
    }

    public async create(tenant: Tenant): Promise<void> {
        await prisma.tenant.create({
            data: {
                id: tenant.id,
                name: tenant.name,
                plan: tenant.plan,
                isActive: tenant.isActive,
                createdAt: tenant.createdAt,
                updatedAt: tenant.updatedAt,
            },
        });
    }

    public async update(tenant: Tenant): Promise<void> {
        const exists = await prisma.tenant.findUnique({ where: { id: tenant.id } });

        if (!exists) {
            throw new Error(`Tenant no encontrado para actualizar: ${tenant.id}`);
        }

        await prisma.tenant.update({
            where: { id: tenant.id },
            data: {
                name: tenant.name,
                plan: tenant.plan,
                isActive: tenant.isActive,
                updatedAt: new Date(),
            },
        });
    }

    public async delete(id: string): Promise<void> {
        const exists = await prisma.tenant.findUnique({ where: { id } });

        if (!exists) {
            throw new Error(`Tenant no encontrado para eliminar: ${id}`);
        }

        await prisma.tenant.delete({
            where: { id },
        });
    }
}
