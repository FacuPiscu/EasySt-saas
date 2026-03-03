import { Router } from "express";
import { PrismaCategoryRepository } from "../../infrastructure/repositories/PrismaCategoryRepository";
import { CreateCategoryUseCase } from "../../application/use-cases/CreateCategoryUseCase";
import { GetCategoriesUseCase } from "../../application/use-cases/GetCategoriesUseCase";
import { CategoryController } from "../controllers/CategoryController";
import { AuthMiddleware } from "../middlewares/AuthMiddleware";

const categoryRoutes = Router();

// Inyección de dependencias
const categoryRepository = new PrismaCategoryRepository();
const createCategoryUseCase = new CreateCategoryUseCase(categoryRepository);
const getCategoriesUseCase = new GetCategoriesUseCase(categoryRepository);

const categoryController = new CategoryController(createCategoryUseCase, getCategoriesUseCase);

categoryRoutes.post("/", AuthMiddleware, (req, res) => categoryController.createCategory(req as any, res));
categoryRoutes.get("/", AuthMiddleware, (req, res) => categoryController.getCategories(req as any, res));

export { categoryRoutes };
