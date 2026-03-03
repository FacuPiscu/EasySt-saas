import { Response } from "express";
import { CreateProductUseCase, CreateProductDTO } from "../../application/use-cases/CreateProductUseCase";
import { GetProductsUseCase } from "../../application/use-cases/GetProductsUseCase";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";

export class ProductController {
    constructor(
        private readonly createProductUseCase: CreateProductUseCase,
        private readonly getProductsUseCase: GetProductsUseCase
    ) { }

    public async createProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // Extraer el tenantId directamente del token verificado por AuthMiddleware
            const tenantId = req.user?.tenantId;
            const { name, description, price, reorderPoint, categoryId } = req.body;

            if (!tenantId || !name || price === undefined || reorderPoint === undefined) {
                res.status(400).json({ error: "Faltan datos requeridos (name, price, reorderPoint)." });
                return;
            }

            const dto: CreateProductDTO = {
                tenantId,
                name: String(name),
                description: description ? String(description) : undefined,
                price: Number(price),
                reorderPoint: Number(reorderPoint),
                categoryId: categoryId ? String(categoryId) : undefined
            };

            const product = await this.createProductUseCase.execute(dto);
            res.status(201).json(product);
        } catch (error: any) {
            res.status(400).json({ error: error.message || "Ocurrió un error al registrar el producto." });
        }
    }

    public async getProducts(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // Extracción estricta del tenantId del payload del Token.
            const tenantId = req.user?.tenantId;

            if (!tenantId) {
                res.status(400).json({ error: "Credenciales de Tenant no válidas." });
                return;
            }

            const products = await this.getProductsUseCase.execute(tenantId);
            res.status(200).json(products);
        } catch (error: any) {
            res.status(400).json({ error: error.message || "Ocurrió un error al obtener los productos." });
        }
    }
}
