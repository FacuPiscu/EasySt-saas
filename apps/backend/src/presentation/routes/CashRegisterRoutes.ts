import { Router } from "express";
import { PrismaCashRegisterSessionRepository } from "../../infrastructure/repositories/PrismaCashRegisterSessionRepository";
import { PrismaSaleRepository } from "../../infrastructure/repositories/PrismaSaleRepository";
import { OpenShiftUseCase } from "../../application/use-cases/OpenShiftUseCase";
import { CloseShiftUseCase } from "../../application/use-cases/CloseShiftUseCase";
import { CashRegisterController } from "../controllers/CashRegisterController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";

const cashRegisterRoutes = Router();

// Inyección de dependencias puras
const sessionRepository = new PrismaCashRegisterSessionRepository();
const saleRepository = new PrismaSaleRepository();

const openShiftUseCase = new OpenShiftUseCase(sessionRepository);
const closeShiftUseCase = new CloseShiftUseCase(sessionRepository, saleRepository);

const cashRegisterController = new CashRegisterController(openShiftUseCase, closeShiftUseCase);

// Las rutas son vigiladas por el middleware, inyectando de forma segura req.user
cashRegisterRoutes.post("/open", AuthMiddleware, (req, res) => cashRegisterController.openCashRegister(req as any, res));
cashRegisterRoutes.post("/close", AuthMiddleware, (req, res) => cashRegisterController.closeCashRegister(req as any, res));

export { cashRegisterRoutes };
