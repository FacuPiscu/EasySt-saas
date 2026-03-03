import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User, Role } from "../../domain/entities/User";
import { prisma } from "../database/prismaClient";

export class PrismaUserRepository implements IUserRepository {
    public async findById(tenantId: string, id: string): Promise<User | null> {
        const data = await prisma.user.findFirst({
            where: {
                id,
                tenantId,
            },
        });

        if (!data) return null;

        return User.create(
            data.id,
            data.tenantId,
            data.email,
            data.passwordHash,
            data.name,
            data.role as Role,
            data.createdAt,
            data.updatedAt
        );
    }

    public async findByEmail(email: string): Promise<User | null> {
        const data = await prisma.user.findFirst({
            where: {
                email,
            },
        });

        if (!data) return null;

        return User.create(
            data.id,
            data.tenantId,
            data.email,
            data.passwordHash,
            data.name,
            data.role as Role,
            data.createdAt,
            data.updatedAt
        );
    }

    public async create(tenantId: string, user: User): Promise<void> {
        await prisma.user.create({
            data: {
                id: user.id,
                tenantId,
                email: user.email,
                passwordHash: user.passwordHash,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
        });
    }

    public async update(tenantId: string, user: User): Promise<void> {
        const exists = await prisma.user.findFirst({
            where: { id: user.id, tenantId },
        });

        if (!exists) {
            throw new Error(`Usuario no encontrado para actualizar: ${user.id}`);
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                email: user.email,
                passwordHash: user.passwordHash,
                name: user.name,
                role: user.role,
                updatedAt: new Date(),
            },
        });
    }

    public async delete(tenantId: string, id: string): Promise<void> {
        const exists = await prisma.user.findFirst({
            where: { id, tenantId },
        });

        if (!exists) {
            throw new Error(`Usuario no encontrado para eliminar: ${id}`);
        }

        await prisma.user.delete({
            where: { id },
        });
    }
}
