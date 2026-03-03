import { randomUUID } from "crypto";
import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { Batch } from "../../domain/entities/Batch";

export interface AddBatchDTO {
    tenantId: string;
    productId: string;
    barcode: string;
    cost: number;
    stock: number;
    expirationDate?: string;
}

export class AddBatchUseCase {
    constructor(private readonly productRepository: IProductRepository) { }

    public async execute(dto: AddBatchDTO): Promise<Batch> {
        const { tenantId, productId, barcode, cost, stock, expirationDate } = dto;

        // Recuperamos el producto, si no existe o no pertenece al Tenant lanzamos error
        const product = await this.productRepository.findById(tenantId, productId);

        if (!product) {
            throw new Error(`Producto no encontrado para el identificador: ${productId}`);
        }

        const now = new Date();
        const parsedExpiration = expirationDate ? new Date(expirationDate) : null;

        const newBatch = Batch.create(
            randomUUID(),
            product.id,
            barcode,
            cost,
            stock,
            parsedExpiration,
            now,
            now
        );

        // Agregamos el lote a su raíz (Producto) porque lo trataremos como Aggregate Root
        product.batches.push(newBatch);

        // Se envía a persistir en Prisma como actualización central
        await this.productRepository.update(tenantId, product);

        return newBatch;
    }
}
