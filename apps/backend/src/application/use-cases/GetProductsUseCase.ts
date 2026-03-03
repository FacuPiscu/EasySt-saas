import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { Product } from "../../domain/entities/Product";

export class GetProductsUseCase {
    constructor(private readonly productRepository: IProductRepository) { }

    public async execute(tenantId: string): Promise<Product[]> {
        return await this.productRepository.findAll(tenantId);
    }
}
