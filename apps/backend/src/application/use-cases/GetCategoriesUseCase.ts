import { ICategoryRepository } from "../../domain/repositories/ICategoryRepository";
import { Category } from "../../domain/entities/Category";

export class GetCategoriesUseCase {
    constructor(private readonly categoryRepository: ICategoryRepository) { }

    public async execute(tenantId: string): Promise<Category[]> {
        return await this.categoryRepository.findAll(tenantId);
    }
}
