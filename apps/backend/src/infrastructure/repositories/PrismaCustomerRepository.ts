import { ICustomerRepository } from "../../domain/repositories/ICustomerRepository";
import { Customer } from "../../domain/entities/Customer";
import { prisma } from "../database/prismaClient";

export class PrismaCustomerRepository implements ICustomerRepository {
    public async findById(tenantId: string, id: string): Promise<Customer | null> {
        const data = await prisma.customer.findFirst({
            where: {
                id,
                tenantId,
            },
        });

        if (!data) return null;

        return Customer.create(
            data.id,
            data.tenantId,
            data.name,
            data.dni,
            data.createdAt,
            data.updatedAt
        );
    }

    public async findByDNI(tenantId: string, dni: string): Promise<Customer | null> {
        const data = await prisma.customer.findFirst({
            where: {
                dni,
                tenantId,
            },
        });

        if (!data) return null;

        return Customer.create(
            data.id,
            data.tenantId,
            data.name,
            data.dni,
            data.createdAt,
            data.updatedAt
        );
    }

    public async findAll(tenantId: string): Promise<Customer[]> {
        const data = await prisma.customer.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' }
        });

        return data.map(d => Customer.create(
            d.id,
            d.tenantId,
            d.name,
            d.dni,
            d.createdAt,
            d.updatedAt
        ));
    }

    public async create(tenantId: string, customer: Customer): Promise<void> {
        await prisma.customer.create({
            data: {
                id: customer.id,
                tenantId,
                name: customer.name,
                dni: customer.dni,
                createdAt: customer.createdAt,
                updatedAt: customer.updatedAt,
            },
        });
    }

    public async update(tenantId: string, customer: Customer): Promise<void> {
        const exists = await prisma.customer.findFirst({
            where: { id: customer.id, tenantId },
        });

        if (!exists) {
            throw new Error(`Cliente no encontrado para actualizar: ${customer.id}`);
        }

        await prisma.customer.update({
            where: { id: customer.id },
            data: {
                name: customer.name,
                dni: customer.dni,
                updatedAt: new Date(),
            },
        });
    }

    public async delete(tenantId: string, id: string): Promise<void> {
        const exists = await prisma.customer.findFirst({
            where: { id, tenantId },
        });

        if (!exists) {
            throw new Error(`Cliente no encontrado para eliminar: ${id}`);
        }

        await prisma.customer.delete({
            where: { id },
        });
    }
}
