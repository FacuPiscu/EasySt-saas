import { Router } from "express";
import { PrismaSaleRepository } from "../../infrastructure/repositories/PrismaSaleRepository";
import { PrismaProductRepository } from "../../infrastructure/repositories/PrismaProductRepository";
import { GetDailySalesUseCase } from "../../application/use-cases/GetDailySalesUseCase";
import { GetLowStockProductsUseCase } from "../../application/use-cases/GetLowStockProductsUseCase";
import { ReportController } from "../controllers/ReportController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";

const reportRoutes = Router();

// Inyección de dependencias
const saleRepository = new PrismaSaleRepository();
const productRepository = new PrismaProductRepository();

const getDailySalesUseCase = new GetDailySalesUseCase(saleRepository);
const getLowStockProductsUseCase = new GetLowStockProductsUseCase(productRepository);

const reportController = new ReportController(getDailySalesUseCase, getLowStockProductsUseCase);

reportRoutes.get("/daily-sales", AuthMiddleware, (req, res) => reportController.getDailySales(req as any, res));
reportRoutes.get("/low-stock", AuthMiddleware, (req, res) => reportController.getLowStock(req as any, res));

export { reportRoutes };
