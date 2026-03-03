import { randomUUID } from "crypto";
import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { Product } from "../../domain/entities/Product";

export interface CreateProductDTO {
    tenantId: string;
    categoryId?: string;
    name: string;
    description?: string;
    price: number;
    reorderPoint: number;
}

export class CreateProductUseCase {
    constructor(private readonly productRepository: IProductRepository) { }

    public async execute(dto: CreateProductDTO): Promise<Product> {
        const { tenantId, categoryId, name, description, price, reorderPoint } = dto;
        const now = new Date();

        const product = Product.create(
            randomUUID(),
            tenantId,
            categoryId || null,
            name,
            description || null,
            price,
            reorderPoint,
            now,
            now,
            []
        );

        await this.productRepository.create(tenantId, product);

        return product;
    }
}
