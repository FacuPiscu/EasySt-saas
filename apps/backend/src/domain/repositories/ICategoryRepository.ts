import { Category } from "../entities/Category";

export interface ICategoryRepository {
    findById(tenantId: string, id: string): Promise<Category | null>;
    findAll(tenantId: string): Promise<Category[]>;
    create(tenantId: string, category: Category): Promise<void>;
    update(tenantId: string, category: Category): Promise<void>;
    delete(tenantId: string, id: string): Promise<void>;
}
