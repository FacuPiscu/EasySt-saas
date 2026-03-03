import { User } from "../entities/User";

export interface IUserRepository {
    findById(tenantId: string, id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    create(tenantId: string, user: User): Promise<void>;
    update(tenantId: string, user: User): Promise<void>;
    delete(tenantId: string, id: string): Promise<void>;
}
