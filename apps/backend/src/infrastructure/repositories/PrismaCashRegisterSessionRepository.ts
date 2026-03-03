import { ICashRegisterSessionRepository } from "../../domain/repositories/ICashRegisterSessionRepository";
import { CashRegisterSession, SessionStatus } from "../../domain/entities/CashRegisterSession";
import { prisma } from "../database/prismaClient";

export class PrismaCashRegisterSessionRepository implements ICashRegisterSessionRepository {
    public async findOpenSessionByUserId(tenantId: string, userId: string): Promise<CashRegisterSession | null> {
        const data = await prisma.cashRegisterSession.findFirst({
            where: {
                tenantId,
                userId,
                status: 'OPEN'
            }
        });

        if (!data) return null;

        return CashRegisterSession.create(
            data.id,
            data.tenantId,
            data.userId,
            data.startTime,
            data.endTime,
            Number(data.initialAmount),
            data.declaredAmount ? Number(data.declaredAmount) : null,
            data.calculatedAmount ? Number(data.calculatedAmount) : null,
            data.status as SessionStatus,
            data.createdAt,
            data.updatedAt
        );
    }

    public async findById(tenantId: string, id: string): Promise<CashRegisterSession | null> {
        const data = await prisma.cashRegisterSession.findFirst({
            where: {
                id,
                tenantId
            }
        });

        if (!data) return null;

        return CashRegisterSession.create(
            data.id,
            data.tenantId,
            data.userId,
            data.startTime,
            data.endTime,
            Number(data.initialAmount),
            data.declaredAmount ? Number(data.declaredAmount) : null,
            data.calculatedAmount ? Number(data.calculatedAmount) : null,
            data.status as SessionStatus,
            data.createdAt,
            data.updatedAt
        );
    }

    public async create(tenantId: string, session: CashRegisterSession): Promise<void> {
        await prisma.cashRegisterSession.create({
            data: {
                id: session.id,
                tenantId: session.tenantId,
                userId: session.userId,
                startTime: session.startTime,
                endTime: session.endTime,
                initialAmount: session.initialAmount,
                declaredAmount: session.declaredAmount,
                calculatedAmount: session.calculatedAmount,
                status: session.status as any,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt
            }
        });
    }

    public async update(tenantId: string, session: CashRegisterSession): Promise<void> {
        await prisma.cashRegisterSession.update({
            where: { id: session.id },
            data: {
                endTime: session.endTime,
                declaredAmount: session.declaredAmount,
                calculatedAmount: session.calculatedAmount,
                status: session.status as any,
                updatedAt: new Date()
            }
        });
    }
}
