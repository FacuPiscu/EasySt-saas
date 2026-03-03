import { Response } from "express";
import { OpenShiftUseCase } from "../../application/use-cases/OpenShiftUseCase";
import { CloseShiftUseCase } from "../../application/use-cases/CloseShiftUseCase";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";

export class CashRegisterController {
    constructor(
        private readonly openShiftUseCase: OpenShiftUseCase,
        private readonly closeShiftUseCase: CloseShiftUseCase
    ) { }

    public async openCashRegister(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // El userId y tenantId son inyectados por el AuthMiddleware, previniendo suplantación de identidad en el body
            const tenantId = req.user?.tenantId;
            const userId = req.user?.userId;
            const { initialAmount } = req.body;

            if (!tenantId || !userId || initialAmount === undefined) {
                res.status(400).json({ error: "Faltan datos requeridos o usuario no autenticado para abrir caja." });
                return;
            }

            const session = await this.openShiftUseCase.execute(tenantId, userId, Number(initialAmount));
            res.status(201).json({
                message: "Caja abierta con éxito.",
                sessionId: session.id
            });
        } catch (error: any) {
            res.status(400).json({ error: error.message || "Ocurrió un error inesperado al abrir la caja." });
        }
    }

    public async closeCashRegister(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const tenantId = req.user?.tenantId;
            const { sessionId, declaredAmount } = req.body;

            if (!tenantId || !sessionId || declaredAmount === undefined) {
                res.status(400).json({ error: "Faltan datos requeridos o usuario no autenticado para cerrar caja." });
                return;
            }

            await this.closeShiftUseCase.execute(tenantId, sessionId, Number(declaredAmount));

            // Respuesta segura sin revelar el calculatedAmount, en español
            res.status(200).json({ message: "Caja cerrada y auditada con éxito." });
        } catch (error: any) {
            res.status(400).json({ error: error.message || "Ocurrió un error inesperado al cerrar la caja." });
        }
    }
}
