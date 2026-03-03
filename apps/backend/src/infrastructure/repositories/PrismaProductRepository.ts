import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { Product } from "../../domain/entities/Product";
import { Batch } from "../../domain/entities/Batch";
import { prisma } from "../database/prismaClient";

export class PrismaProductRepository implements IProductRepository {
    public async findById(tenantId: string, id: string): Promise<Product | null> {
        const data = await prisma.product.findUnique({
            where: { id },
            include: {
                batches: {
                    orderBy: {
                        createdAt: 'asc' // Los lotes más antiguos primero
                    }
                }
            }
        });

        // Verificación en memoria de aislamiento Multitenant en español
        if (!data || data.tenantId !== tenantId) return null;

        const batches = data.batches.map(b => Batch.create(
            b.id,
            b.productId,
            b.barcode,
            Number(b.cost),
            b.stock,
            b.expirationDate,
            b.createdAt,
            b.updatedAt
        ));

        return Product.create(
            data.id,
            data.tenantId,
            data.categoryId,
            data.name,
            data.description,
            Number(data.price),
            data.reorderPoint,
            data.createdAt,
            data.updatedAt,
            batches
        );
    }

    public async findAll(tenantId: string): Promise<Product[]> {
        const data = await prisma.product.findMany({
            where: { tenantId },
            include: {
                batches: {
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        });

        return data.map((d) => {
            const batches = d.batches.map(b => Batch.create(
                b.id,
                b.productId,
                b.barcode,
                Number(b.cost),
                b.stock,
                b.expirationDate,
                b.createdAt,
                b.updatedAt
            ));

            return Product.create(
                d.id,
                d.tenantId,
                d.categoryId,
                d.name,
                d.description,
                Number(d.price),
                d.reorderPoint,
                d.createdAt,
                d.updatedAt,
                batches
            );
        });
    }

    public async findLowStock(tenantId: string): Promise<Product[]> {
        // Obtenemos todos los productos (se podría optimizar con RawQuery en SQL puro si el catálogo fuera masivo)
        const products = await this.findAll(tenantId);

        // En español: Filtramos en memoria utilizando la lógica de negocio central (Arquitectura Limpia)
        return products.filter(product => product.needsRestock());
    }

    public async create(tenantId: string, product: Product): Promise<void> {
        await prisma.product.create({
            data: {
                id: product.id,
                tenantId,
                categoryId: product.categoryId,
                name: product.name,
                description: product.description,
                price: product.price,
                reorderPoint: product.reorderPoint,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt,
                batches: {
                    create: product.batches.map(b => ({
                        id: b.id,
                        barcode: b.barcode,
                        cost: b.cost,
                        stock: b.stock,
                        expirationDate: b.expirationDate,
                        createdAt: b.createdAt,
                        updatedAt: b.updatedAt
                    }))
                }
            },
        });
    }

    public async update(tenantId: string, product: Product): Promise<void> {
        const exists = await prisma.product.findFirst({
            where: { id: product.id, tenantId },
        });

        if (!exists) {
            throw new Error(`Producto no encontrado para actualizar: ${product.id}`);
        }

        await prisma.product.update({
            where: {
                id: product.id,
            },
            data: {
                categoryId: product.categoryId,
                name: product.name,
                description: product.description,
                price: product.price,
                reorderPoint: product.reorderPoint,
                updatedAt: new Date(),
                batches: {
                    upsert: product.batches.map((batch) => ({
                        where: { id: batch.id },
                        update: {
                            barcode: batch.barcode,
                            cost: batch.cost,
                            stock: batch.stock,
                            expirationDate: batch.expirationDate,
                            updatedAt: new Date(),
                        },
                        create: {
                            id: batch.id,
                            barcode: batch.barcode,
                            cost: batch.cost,
                            stock: batch.stock,
                            expirationDate: batch.expirationDate,
                            createdAt: batch.createdAt,
                            updatedAt: batch.updatedAt,
                        },
                    })),
                },
            },
        });
    }

    public async delete(tenantId: string, id: string): Promise<void> {
        const exists = await prisma.product.findFirst({
            where: { id, tenantId },
        });

        if (!exists) {
            throw new Error(`Producto no encontrado para eliminar: ${id}`);
        }

        await prisma.product.delete({
            where: { id },
        });
    }
}
