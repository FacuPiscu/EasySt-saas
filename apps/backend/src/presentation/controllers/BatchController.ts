import { Response } from "express";
import { AddBatchUseCase, AddBatchDTO } from "../../application/use-cases/AddBatchUseCase";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";

export class BatchController {
    constructor(private readonly addBatchUseCase: AddBatchUseCase) { }

    public async addBatch(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // El parámetro principal del control es inyectado desde el interceptor JWT
            const tenantId = req.user?.tenantId;
            const { productId } = req.params;
            const { barcode, cost, stock, expirationDate } = req.body;

            if (!tenantId || !productId || !barcode || cost === undefined || stock === undefined) {
                res.status(400).json({ error: "Faltan datos requeridos para registrar el lote (barcode, cost, stock)." });
                return;
            }

            const dto: AddBatchDTO = {
                tenantId: String(tenantId),
                productId: String(productId),
                barcode: String(barcode),
                cost: Number(cost),
                stock: Number(stock),
                expirationDate: expirationDate ? String(expirationDate) : undefined
            };

            const batch = await this.addBatchUseCase.execute(dto);

            res.status(201).json(batch);
        } catch (error: any) {
            res.status(400).json({ error: error.message || "Ocurrió un error inesperado al agregar el lote." });
        }
    }
}
