import { Router } from "express";
import { PrismaTenantRepository } from "../../infrastructure/repositories/PrismaTenantRepository";
import { PrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";
import { CryptoService } from "../../infrastructure/services/CryptoService";
import { RegisterTenantUseCase } from "../../application/use-cases/RegisterTenantUseCase";
import { TenantController } from "../controllers/TenantController";

const tenantRoutes = Router();

// Inyección de dependencias
const tenantRepository = new PrismaTenantRepository();
const userRepository = new PrismaUserRepository();
const cryptoService = new CryptoService();

const registerTenantUseCase = new RegisterTenantUseCase(tenantRepository, userRepository, cryptoService);
const tenantController = new TenantController(registerTenantUseCase);

// Ruta pública para registrar un nuevo plan
tenantRoutes.post("/register", (req, res) => tenantController.registerTenant(req, res));

export { tenantRoutes };
