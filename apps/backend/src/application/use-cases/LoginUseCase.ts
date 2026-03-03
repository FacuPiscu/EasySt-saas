import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { CryptoService } from "../../infrastructure/services/CryptoService";
import jwt from "jsonwebtoken";

export interface LoginDTO {
    email: string;
    password: string;
}

export class LoginUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly cryptoService: CryptoService
    ) { }

    public async execute(dto: LoginDTO): Promise<{ token: string }> {
        const { email, password } = dto;

        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new Error("Credenciales inválidas.");
        }

        const isValidPassword = await this.cryptoService.compare(password, user.passwordHash);

        if (!isValidPassword) {
            throw new Error("Credenciales inválidas.");
        }

        // Firmamos el JWT con un secreto seguro o un default si no existe en entorno
        const secret = process.env.JWT_SECRET || 'easyst-secret-key-fallback';

        // El payload incluye el userId, el tenantId y el rol
        const token = jwt.sign(
            {
                userId: user.id,
                tenantId: user.tenantId,
                role: user.role
            },
            secret,
            { expiresIn: '8h' }
        );

        return { token };
    }
}
