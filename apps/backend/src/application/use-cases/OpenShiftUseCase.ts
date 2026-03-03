import { randomUUID } from "crypto";
import { ICashRegisterSessionRepository } from "../../domain/repositories/ICashRegisterSessionRepository";
import { CashRegisterSession } from "../../domain/entities/CashRegisterSession";

export class OpenShiftUseCase {
    constructor(private readonly sessionRepository: ICashRegisterSessionRepository) { }

    public async execute(tenantId: string, userId: string, initialAmount: number): Promise<CashRegisterSession> {
        const existingSession = await this.sessionRepository.findOpenSessionByUserId(tenantId, userId);

        if (existingSession) {
            throw new Error("El usuario ya tiene un turno de caja abierto.");
        }

        const now = new Date();
        const session = CashRegisterSession.create(
            randomUUID(),
            tenantId,
            userId,
            now,
            null,
            initialAmount,
            null,
            null,
            'OPEN',
            now,
            now
        );

        await this.sessionRepository.create(tenantId, session);

        return session;
    }
}
