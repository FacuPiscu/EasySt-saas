import { Router } from "express";
import { RegisterSaleUseCase } from "../../application/use-cases/RegisterSaleUseCase";
import { PrismaProductRepository } from "../../infrastructure/repositories/PrismaProductRepository";
import { PrismaSaleRepository } from "../../infrastructure/repositories/PrismaSaleRepository";
import { PrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";
import { PrismaCustomerRepository } from "../../infrastructure/repositories/PrismaCustomerRepository";
import { PrismaCashRegisterSessionRepository } from "../../infrastructure/repositories/PrismaCashRegisterSessionRepository";
import { SaleController } from "../controllers/SaleController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";
import { SyncOfflineSalesUseCase } from "../../application/use-cases/SyncOfflineSalesUseCase";

const saleRoutes = Router();

// Inyección de dependencias
const productRepository = new PrismaProductRepository();
const saleRepository = new PrismaSaleRepository();
const userRepository = new PrismaUserRepository();
const customerRepository = new PrismaCustomerRepository();
const sessionRepository = new PrismaCashRegisterSessionRepository();

const registerSaleUseCase = new RegisterSaleUseCase(productRepository, saleRepository, userRepository, customerRepository, sessionRepository);
const syncOfflineSalesUseCase = new SyncOfflineSalesUseCase(productRepository, saleRepository, sessionRepository);
const saleController = new SaleController(registerSaleUseCase, syncOfflineSalesUseCase);

saleRoutes.post("/", AuthMiddleware, (req, res) => saleController.registerSale(req as any, res));
saleRoutes.post("/sync", AuthMiddleware, (req, res) => saleController.syncOffline(req as any, res));

export { saleRoutes };
