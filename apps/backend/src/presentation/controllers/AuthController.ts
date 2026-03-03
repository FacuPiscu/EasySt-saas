import { Request, Response } from "express";
import { LoginUseCase, LoginDTO } from "../../application/use-cases/LoginUseCase";

export class AuthController {
    constructor(private readonly loginUseCase: LoginUseCase) { }

    public async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({ error: "Faltan credenciales obligatorias: email y password." });
                return;
            }

            const dto: LoginDTO = { email: String(email), password: String(password) };

            // Si el login es correcto devolveremos el token JWT
            const result = await this.loginUseCase.execute(dto);

            res.status(200).json(result);
        } catch (error: any) {
            // Unificamos el error HTTP para credenciales inválidas
            res.status(401).json({ error: error.message || "Credenciales inválidas." });
        }
    }
}
