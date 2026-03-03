import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { Product } from "../../domain/entities/Product";

export class GetLowStockProductsUseCase {
    constructor(private readonly productRepository: IProductRepository) { }

    public async execute(tenantId: string): Promise<Product[]> {
        return await this.productRepository.findLowStock(tenantId);
    }
}
