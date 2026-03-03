import { Router } from "express";
import { RegisterCustomerUseCase } from "../../application/use-cases/RegisterCustomerUseCase";
import { PrismaCustomerRepository } from "../../infrastructure/repositories/PrismaCustomerRepository";
import { CustomerController } from "../controllers/CustomerController";

import { AuthMiddleware } from "../middlewares/AuthMiddleware";

const customerRoutes = Router();

// Inyección de dependencias
const customerRepository = new PrismaCustomerRepository();
const registerCustomerUseCase = new RegisterCustomerUseCase(customerRepository);
const customerController = new CustomerController(registerCustomerUseCase);

customerRoutes.post("/", AuthMiddleware, (req, res) => customerController.registerCustomer(req as any, res));

export { customerRoutes };
