import { Router } from "express";
import { PrismaUserRepository } from "../../infrastructure/repositories/PrismaUserRepository";
import { CryptoService } from "../../infrastructure/services/CryptoService";
import { LoginUseCase } from "../../application/use-cases/LoginUseCase";
import { AuthController } from "../controllers/AuthController";

const authRoutes = Router();

// Inyección de dependencias
const userRepository = new PrismaUserRepository();
const cryptoService = new CryptoService();
const loginUseCase = new LoginUseCase(userRepository, cryptoService);
const authController = new AuthController(loginUseCase);

// Las rutas de login no requieren token para ser consumidas
authRoutes.post("/login", (req, res) => authController.login(req, res));

export { authRoutes };
