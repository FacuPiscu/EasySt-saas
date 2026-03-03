import { Router } from "express";
import { PrismaProductRepository } from "../../infrastructure/repositories/PrismaProductRepository";
import { CreateProductUseCase } from "../../application/use-cases/CreateProductUseCase";
import { GetProductsUseCase } from "../../application/use-cases/GetProductsUseCase";
import { ProductController } from "../controllers/ProductController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";

const productRoutes = Router();

// Inyección de dependencias
const productRepository = new PrismaProductRepository();
const createProductUseCase = new CreateProductUseCase(productRepository);
const getProductsUseCase = new GetProductsUseCase(productRepository);

const productController = new ProductController(createProductUseCase, getProductsUseCase);

productRoutes.post("/", AuthMiddleware, (req, res) => productController.createProduct(req as any, res));
productRoutes.get("/", AuthMiddleware, (req, res) => productController.getProducts(req as any, res));

export { productRoutes };
