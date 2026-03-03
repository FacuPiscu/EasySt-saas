import { Router } from "express";
import { PrismaProductRepository } from "../../infrastructure/repositories/PrismaProductRepository";
import { AddBatchUseCase } from "../../application/use-cases/AddBatchUseCase";
import { BatchController } from "../controllers/BatchController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";

const batchRoutes = Router();

// Inyección de dependencias
const productRepository = new PrismaProductRepository();
const addBatchUseCase = new AddBatchUseCase(productRepository);

const batchController = new BatchController(addBatchUseCase);

batchRoutes.post("/:productId/batches", AuthMiddleware, (req, res) => batchController.addBatch(req as any, res));

export { batchRoutes };
