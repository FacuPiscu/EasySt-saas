import { Product } from "../entities/Product";

export interface IProductRepository {
    findById(tenantId: string, id: string): Promise<Product | null>;
    findAll(tenantId: string): Promise<Product[]>;
    findLowStock(tenantId: string): Promise<Product[]>;
    create(tenantId: string, product: Product): Promise<void>;
    update(tenantId: string, product: Product): Promise<void>;
    delete(tenantId: string, id: string): Promise<void>;
}
