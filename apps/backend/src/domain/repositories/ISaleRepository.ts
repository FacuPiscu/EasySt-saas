import { Sale } from "../entities/Sale";

export interface ISaleRepository {
    findById(tenantId: string, id: string): Promise<Sale | null>;
    findAll(tenantId: string): Promise<Sale[]>;
    findSalesByDate(tenantId: string, date: Date): Promise<Sale[]>;
    getDailySalesAggregated(tenantId: string, startDate: Date, endDate: Date): Promise<{ totalAmount: number; breakdown: { method: string; amount: number }[] }>;
    findSalesBySessionId(tenantId: string, sessionId: string): Promise<Sale[]>;
    create(tenantId: string, sale: Sale): Promise<void>;
    saveBulk(tenantId: string, sales: Sale[]): Promise<void>;
    update(tenantId: string, sale: Sale): Promise<void>;
    delete(tenantId: string, id: string): Promise<void>;
}
