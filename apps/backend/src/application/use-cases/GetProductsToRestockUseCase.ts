import { IProductRepository } from "../../domain/repositories/IProductRepository";

export interface RestockProductDTO {
    id: string;
    name: string;
    currentStock: number;
    reorderPoint: number;
}

export class GetProductsToRestockUseCase {
    constructor(private readonly productRepository: IProductRepository) { }

    public async execute(tenantId: string): Promise<RestockProductDTO[]> {
        const products = await this.productRepository.findAll(tenantId);

        // Filtramos en memoria todos los productos que cumplan con la regla de dominio de necesidades de reposición
        return products
            .filter(product => product.needsRestock())
            .map(product => ({
                id: product.id,
                name: product.name,
                currentStock: product.getTotalStock(),
                reorderPoint: product.reorderPoint
            }));
    }
}
