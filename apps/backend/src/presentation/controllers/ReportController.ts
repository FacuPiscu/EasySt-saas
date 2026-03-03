import { Response } from "express";
import { GetDailySalesUseCase } from "../../application/use-cases/GetDailySalesUseCase";
import { GetLowStockProductsUseCase } from "../../application/use-cases/GetLowStockProductsUseCase";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";

export class ReportController {
    constructor(
        private readonly getDailySalesUseCase: GetDailySalesUseCase,
        private readonly getLowStockProductsUseCase: GetLowStockProductsUseCase
    ) { }

    public async getDailySales(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // Extracción estricta del tenantId del payload del Token.
            const tenantId = req.user?.tenantId;

            if (!tenantId) {
                res.status(400).json({ error: "Credenciales de Tenant no válidas." });
                return;
            }

            const report = await this.getDailySalesUseCase.execute(tenantId);
            res.status(200).json(report);
        } catch (error: any) {
            res.status(400).json({ error: error.message || "Ocurrió un error al despachar el reporte de ventas diario." });
        }
    }

    public async getLowStock(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // Extracción estricta del tenantId del payload del Token.
            const tenantId = req.user?.tenantId;

            if (!tenantId) {
                res.status(400).json({ error: "Credenciales de Tenant no válidas." });
                return;
            }

            const itemsCount = await this.getLowStockProductsUseCase.execute(tenantId);
            res.status(200).json(itemsCount);
        } catch (error: any) {
            res.status(400).json({ error: error.message || "Ocurrió un error al despachar el listado de bajo stock." });
        }
    }
}
