import { ICategoryRepository } from "../../domain/repositories/ICategoryRepository";
import { Category } from "../../domain/entities/Category";
import { prisma } from "../database/prismaClient";

export class PrismaCategoryRepository implements ICategoryRepository {
    public async findById(tenantId: string, id: string): Promise<Category | null> {
        const data = await prisma.category.findFirst({
            where: { id, tenantId },
        });

        if (!data) return null;

        return Category.create(
            data.id,
            data.tenantId,
            data.name,
            data.createdAt,
            data.updatedAt
        );
    }

    public async findAll(tenantId: string): Promise<Category[]> {
        const data = await prisma.category.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' }
        });

        return data.map((d) =>
            Category.create(
                d.id,
                d.tenantId,
                d.name,
                d.createdAt,
                d.updatedAt
            )
        );
    }

    public async create(tenantId: string, category: Category): Promise<void> {
        await prisma.category.create({
            data: {
                id: category.id,
                tenantId,
                name: category.name,
                createdAt: category.createdAt,
                updatedAt: category.updatedAt,
            },
        });
    }

    public async update(tenantId: string, category: Category): Promise<void> {
        const exists = await prisma.category.findFirst({ where: { id: category.id, tenantId } });

        if (!exists) {
            throw new Error(`Categoría no encontrada para actualizar: ${category.id}`);
        }

        await prisma.category.update({
            where: { id: category.id },
            data: {
                name: category.name,
                updatedAt: new Date(),
            },
        });
    }

    public async delete(tenantId: string, id: string): Promise<void> {
        const exists = await prisma.category.findFirst({ where: { id, tenantId } });

        if (!exists) {
            throw new Error(`Categoría no encontrada para eliminar: ${id}`);
        }

        await prisma.category.delete({
            where: { id },
        });
    }
}
