import { Router } from "express";
import { PrismaProductRepository } from "../../infrastructure/repositories/PrismaProductRepository";
import { CreateProductUseCase } from "../../application/use-cases/CreateProductUseCase";
import { GetProductsUseCase } from "../../application/use-cases/GetProductsUseCase";
import { BulkImportProductsUseCase } from "../../application/use-cases/BulkImportProductsUseCase";
import { ProductController } from "../controllers/ProductController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";

const productRoutes = Router();

// Inyección de dependencias
const productRepository = new PrismaProductRepository();
const createProductUseCase = new CreateProductUseCase(productRepository);
const getProductsUseCase = new GetProductsUseCase(productRepository);
const bulkImportProductsUseCase = new BulkImportProductsUseCase(productRepository);

const productController = new ProductController(
    createProductUseCase,
    getProductsUseCase,
    bulkImportProductsUseCase
);

productRoutes.post("/", AuthMiddleware, (req, res) => productController.createProduct(req as any, res));
productRoutes.post("/bulk-import", AuthMiddleware, (req, res) => productController.bulkImport(req as any, res));
productRoutes.get("/", AuthMiddleware, (req, res) => productController.getProducts(req as any, res));

export { productRoutes };
