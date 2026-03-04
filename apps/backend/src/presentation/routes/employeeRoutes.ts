import { Router } from 'express';
import { EmployeeController } from '../controllers/EmployeeController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

const router = Router();

// Protegemos la ruta para que solo los usuarios logueados (Cacho) puedan crear empleados
router.post('/', AuthMiddleware, EmployeeController.create as any);
router.get('/', AuthMiddleware, EmployeeController.getAll as any);
router.put('/:id', AuthMiddleware, EmployeeController.update as any);
router.delete('/:id', AuthMiddleware, EmployeeController.delete as any);
router.patch('/:id/clock', AuthMiddleware, EmployeeController.toggleClock as any);

export default router;