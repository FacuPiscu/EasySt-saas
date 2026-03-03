import { ISaleRepository } from "../../domain/repositories/ISaleRepository";

export class GetDailySalesUseCase {
    constructor(private readonly saleRepository: ISaleRepository) { }

    public async execute(tenantId: string): Promise<{ totalAmount: number; breakdown: { method: string; amount: number }[] }> {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        return await this.saleRepository.getDailySalesAggregated(tenantId, startOfDay, endOfDay);
    }
}
