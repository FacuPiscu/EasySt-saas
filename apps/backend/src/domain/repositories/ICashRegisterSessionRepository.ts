import { CashRegisterSession } from "../entities/CashRegisterSession";

export interface ICashRegisterSessionRepository {
    findOpenSessionByUserId(tenantId: string, userId: string): Promise<CashRegisterSession | null>;
    findById(tenantId: string, id: string): Promise<CashRegisterSession | null>;
    create(tenantId: string, session: CashRegisterSession): Promise<void>;
    update(tenantId: string, session: CashRegisterSession): Promise<void>;
}
