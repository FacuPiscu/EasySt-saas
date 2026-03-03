export class Category {
    constructor(
        public readonly id: string,
        public readonly tenantId: string,
        public name: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    static create(
        id: string,
        tenantId: string,
        name: string,
        createdAt: Date,
        updatedAt: Date
    ): Category {
        return new Category(id, tenantId, name, createdAt, updatedAt);
    }
}
