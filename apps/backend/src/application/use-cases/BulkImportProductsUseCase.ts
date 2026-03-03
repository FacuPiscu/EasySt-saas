import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { Product } from "../../domain/entities/Product";
import { Batch } from "../../domain/entities/Batch";
import { randomUUID } from "crypto";

export interface BulkImportProductDTO {
    id?: string;
    name: string;
    description?: string;
    price: number;
    reorderPoint: number;
    categoryId?: string;
    batches: {
        id?: string;
        barcode: string;
        cost: number;
        stock: number;
        expirationDate: string | null;
    }[];
}

export class BulkImportProductsUseCase {
    constructor(private readonly productRepository: IProductRepository) { }

    public async execute(tenantId: string, dtos: BulkImportProductDTO[]): Promise<void> {
        const products = dtos.map(dto => {
            const productId = dto.id || randomUUID();

            const batches = dto.batches.map(b => Batch.create(
                b.id || randomUUID(),
                productId,
                b.barcode,
                b.cost,
                b.stock,
                b.expirationDate ? new Date(b.expirationDate) : null,
                new Date(),
                new Date()
            ));

            return Product.create(
                productId,
                tenantId,
                dto.categoryId || null,
                dto.name,
                dto.description || "",
                dto.price,
                dto.reorderPoint,
                new Date(),
                new Date(),
                batches
            );
        });

        await this.productRepository.bulkImport(tenantId, products);
    }
}
