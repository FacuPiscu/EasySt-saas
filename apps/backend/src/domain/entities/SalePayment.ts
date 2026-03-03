export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'TRANSFER';

export class SalePayment {
    constructor(
        public readonly id: string,
        public readonly tenantId: string,
        public readonly saleId: string,
        public amount: number,
        public method: PaymentMethod,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    static create(
        id: string,
        tenantId: string,
        saleId: string,
        amount: number,
        method: PaymentMethod,
        createdAt: Date,
        updatedAt: Date
    ): SalePayment {
        return new SalePayment(id, tenantId, saleId, amount, method, createdAt, updatedAt);
    }
}
