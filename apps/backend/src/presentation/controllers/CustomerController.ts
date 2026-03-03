import { Response } from "express";
import { RegisterCustomerUseCase } from "../../application/use-cases/RegisterCustomerUseCase";
import { RegisterCustomerDTO } from "../../application/dtos/RegisterCustomerDTO";
import { AuthenticatedRequest } from "../middlewares/AuthMiddleware";

export class CustomerController {
    constructor(private readonly registerCustomerUseCase: RegisterCustomerUseCase) { }

    public async registerCustomer(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // El tenantId es inyectado por el AuthMiddleware para mayor seguridad arquitectónica
            const tenantId = req.user?.tenantId;
            const { name, dni } = req.body;

            if (!tenantId || !name || !dni) {
                res.status(400).json({ error: "Faltan datos requeridos (name, dni) o credenciales inválidas." });
                return;
            }

            const dto: RegisterCustomerDTO = {
                tenantId: String(tenantId),
                name: String(name),
                dni: String(dni),
            };

            const customer = await this.registerCustomerUseCase.execute(dto);

            res.status(201).json(customer);
        } catch (error: any) {
            res.status(400).json({ error: error.message || "Ocurrió un error inesperado al registrar el cliente." });
        }
    }
}
