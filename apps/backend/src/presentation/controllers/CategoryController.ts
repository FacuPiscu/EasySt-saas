import { Response } from "express";
import { CreateCategoryUseCase } from "../../application/use-cases/CreateCategoryUseCase";
import { GetCategoriesUseCase } from "../../application/use-cases/GetCategoriesUseCase";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";

export class CategoryController {
    constructor(
        private readonly createCategoryUseCase: CreateCategoryUseCase,
        private readonly getCategoriesUseCase: GetCategoriesUseCase
    ) { }

    public async createCategory(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // Aislamiento Multi-Tenant garantizado extrayendo el ID desde el payload del JWT
            const tenantId = req.user?.tenantId;
            const { name } = req.body;

            if (!tenantId || !name) {
                res.status(400).json({ error: "Faltan datos requeridos (name)." });
                return;
            }

            const category = await this.createCategoryUseCase.execute({ tenantId: String(tenantId), name: String(name) });
            res.status(201).json(category);
        } catch (error: any) {
            res.status(400).json({ error: error.message || "Ocurrió un error al crear la categoría." });
        }
    }

    public async getCategories(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // Aislamiento Multi-Tenant garantizado extrayendo el ID desde el payload del JWT
            const tenantId = req.user?.tenantId;

            if (!tenantId) {
                res.status(400).json({ error: "Credenciales de Tenant no válidas." });
                return;
            }

            const categories = await this.getCategoriesUseCase.execute(tenantId);
            res.status(200).json(categories);
        } catch (error: any) {
            res.status(400).json({ error: error.message || "Ocurrió un error al obtener las categorías." });
        }
    }
}
