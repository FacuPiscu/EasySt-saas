import { Router } from 'express';
import { EmployeeRoleController } from '../controllers/EmployeeRoleController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

const router = Router();

router.post('/', AuthMiddleware, EmployeeRoleController.create as any);
router.get('/', AuthMiddleware, EmployeeRoleController.getAll as any);

export default router;
