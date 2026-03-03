import { randomUUID } from "crypto";
import { ITenantRepository } from "../../domain/repositories/ITenantRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { CryptoService } from "../../infrastructure/services/CryptoService";
import { RegisterTenantDTO } from "../dtos/RegisterTenantDTO";
import { Tenant } from "../../domain/entities/Tenant";
import { User, Role } from "../../domain/entities/User";

export class RegisterTenantUseCase {
    constructor(
        private readonly tenantRepository: ITenantRepository,
        private readonly userRepository: IUserRepository,
        private readonly cryptoService: CryptoService
    ) { }

    public async execute(dto: RegisterTenantDTO): Promise<{ tenantId: string, userId: string }> {
        const { tenantName, adminName, adminEmail, adminPassword } = dto;

        // Validamos exclusividad de email en la plataforma global
        const existingUser = await this.userRepository.findByEmail(adminEmail);
        if (existingUser) {
            throw new Error("El correo ya está registrado en el sistema.");
        }

        const tenantId = randomUUID();
        const userId = randomUUID();
        const now = new Date();

        // Encriptar contraseña del administrador local
        const passwordHash = await this.cryptoService.hash(adminPassword);

        // Fabricar las dos Entidades de Dominio entrelazadas
        const newTenant = Tenant.create(
            tenantId,
            tenantName,
            "DEMO",
            true,
            now,
            now
        );

        const newAdmin = User.create(
            userId,
            tenantId,
            adminEmail,
            passwordHash,
            adminName,
            'ADMIN' as Role, // Cast a Role estrictamente tipado
            now,
            now
        );

        // Persistiendo entidades en sus respectivos repositorios
        await this.tenantRepository.create(newTenant);
        await this.userRepository.create(tenantId, newAdmin);

        return { tenantId, userId };
    }
}
