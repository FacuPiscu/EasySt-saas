import { randomUUID } from "crypto";
import { ICategoryRepository } from "../../domain/repositories/ICategoryRepository";
import { Category } from "../../domain/entities/Category";

export interface CreateCategoryDTO {
    tenantId: string;
    name: string;
}

export class CreateCategoryUseCase {
    constructor(private readonly categoryRepository: ICategoryRepository) { }

    public async execute(dto: CreateCategoryDTO): Promise<Category> {
        const { tenantId, name } = dto;
        const now = new Date();

        const category = Category.create(
            randomUUID(),
            tenantId,
            name,
            now,
            now
        );

        await this.categoryRepository.create(tenantId, category);

        return category;
    }
}
