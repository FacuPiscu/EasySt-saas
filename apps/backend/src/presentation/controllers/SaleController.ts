import { Response } from "express";
import { RegisterSaleUseCase } from "../../application/use-cases/RegisterSaleUseCase";
import { RegisterSaleDTO, RegisterSaleItemDTO, RegisterSalePaymentDTO } from "../../application/dtos/RegisterSaleDTO";
import { SyncOfflineSalesUseCase } from "../../application/use-cases/SyncOfflineSalesUseCase";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";

export class SaleController {
    constructor(
        private readonly registerSaleUseCase: RegisterSaleUseCase,
        private readonly syncOfflineSalesUseCase: SyncOfflineSalesUseCase
    ) { }

    public async registerSale(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // El userId y tenantId son inyectados por el AuthMiddleware con seguridad extrema
            const tenantId = req.user?.tenantId;
            const userId = req.user?.userId;
            const { customerId, items, payments } = req.body;

            if (!tenantId || !userId || !items || !payments) {
                res.status(400).json({ error: "Faltan datos requeridos (items, payments) o credenciales de sesión inválidas." });
                return;
            }

            const dto: RegisterSaleDTO = {
                tenantId: String(tenantId),
                userId: String(userId),
                customerId: customerId ? String(customerId) : undefined,
                items: items as RegisterSaleItemDTO[],
                payments: payments as RegisterSalePaymentDTO[],
            };

            const sale = await this.registerSaleUseCase.execute(dto);

            res.status(201).json(sale);
        } catch (error: any) {
            res.status(400).json({ error: error.message || "Ocurrió un error inesperado al procesar la venta." });
        }
    }

    public async syncOffline(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // El userId y tenantId son inyectados desde el Token, el cliente no los puede adulterar
            const tenantId = req.user?.tenantId;
            const userId = req.user?.userId;
            const { sales } = req.body;

            if (!tenantId || !userId || !sales || !Array.isArray(sales)) {
                res.status(400).json({ error: "Faltan datos requeridos o el listado de ventas (sales) no es un arreglo válido." });
                return;
            }

            const result = await this.syncOfflineSalesUseCase.execute(tenantId, userId, sales);

            res.status(200).json({
                message: "Sincronización masiva de ventas offline completada con éxito.",
                synced: result.syncedCount
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || "Ocurrió un error inesperado al sincronizar ventas offline." });
        }
    }
}
