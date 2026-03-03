export class Customer {
    constructor(
        public readonly id: string,
        public readonly tenantId: string,
        public name: string,
        public dni: string,
        public readonly createdAt: Date,
        public updatedAt: Date
    ) { }

    static create(
        id: string,
        tenantId: string,
        name: string,
        dni: string,
        createdAt: Date,
        updatedAt: Date
    ): Customer {
        return new Customer(id, tenantId, name, dni, createdAt, updatedAt);
    }
}
