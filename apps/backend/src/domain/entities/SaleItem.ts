export class SaleItem {
    constructor(
        public readonly id: string,
        public readonly tenantId: string,
        public readonly saleId: string,
        public readonly productId: string,
        public quantity: number,
        public price: number,
        public readonly createdAt: Date,
        public updatedAt: Date
    ) { }

    static create(
        id: string,
        tenantId: string,
        saleId: string,
        productId: string,
        quantity: number,
        price: number,
        createdAt: Date,
        updatedAt: Date
    ): SaleItem {
        return new SaleItem(id, tenantId, saleId, productId, quantity, price, createdAt, updatedAt);
    }
}
