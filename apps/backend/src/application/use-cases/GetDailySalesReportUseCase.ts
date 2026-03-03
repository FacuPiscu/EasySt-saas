import { ISaleRepository } from "../../domain/repositories/ISaleRepository";

export interface DailySalesReportDTO {
    totalSales: number;
    totalAmount: number;
    paymentsGroupedByMethod: Record<string, number>;
}

export class GetDailySalesReportUseCase {
    constructor(private readonly saleRepository: ISaleRepository) { }

    public async execute(tenantId: string, date: Date): Promise<DailySalesReportDTO> {
        const sales = await this.saleRepository.findSalesByDate(tenantId, date);

        let totalAmount = 0;
        const paymentsGroupedByMethod: Record<string, number> = {};

        // Recorremos las ventas sumando los totales y agrupando montos exactos de pago divididos (Ej: Efectivo, Tarjeta)
        for (const sale of sales) {
            totalAmount += sale.totalAmount;

            for (const payment of sale.payments) {
                if (!paymentsGroupedByMethod[payment.method]) {
                    paymentsGroupedByMethod[payment.method] = 0;
                }
                paymentsGroupedByMethod[payment.method] += payment.amount;
            }
        }

        return {
            totalSales: sales.length,
            totalAmount,
            paymentsGroupedByMethod,
        };
    }
}
