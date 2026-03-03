import { ICashRegisterSessionRepository } from "../../domain/repositories/ICashRegisterSessionRepository";
import { ISaleRepository } from "../../domain/repositories/ISaleRepository";

export class CloseShiftUseCase {
    constructor(
        private readonly sessionRepository: ICashRegisterSessionRepository,
        private readonly saleRepository: ISaleRepository
    ) { }

    public async execute(tenantId: string, sessionId: string, declaredAmount: number): Promise<void> {
        const session = await this.sessionRepository.findById(tenantId, sessionId);

        if (!session) {
            throw new Error("Sesión de caja no encontrada.");
        }

        if (session.status === 'CLOSED') {
            throw new Error("La sesión ya se encuentra cerrada.");
        }

        // Buscamos todas las ventas asociadas a este turno para auditar
        const sales = await this.saleRepository.findSalesBySessionId(tenantId, sessionId);

        // Lógica de Cierre Ciego: Calculamos el monto esperado sumando el fondo inicial + los pagos en efectivo
        // No se le revela al cajero cuánto esperamos que tenga, él declara primero.
        let cashTotal = 0;
        for (const sale of sales) {
            for (const payment of sale.payments) {
                if (payment.method === 'CASH') {
                    cashTotal += payment.amount;
                }
            }
        }

        const calculatedAmount = Number(session.initialAmount) + cashTotal;

        // Cerramos la entidad y aplicamos la auditoría
        session.close(declaredAmount, calculatedAmount);

        await this.sessionRepository.update(tenantId, session);
    }
}
