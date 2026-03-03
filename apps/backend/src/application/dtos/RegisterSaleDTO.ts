export interface RegisterSaleItemDTO {
    productId: string;
    quantity: number;
    barcode?: string;
}

export interface RegisterSalePaymentDTO {
    method: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'TRANSFER';
    amount: number;
}

export interface RegisterSaleDTO {
    tenantId: string;
    userId: string;
    customerId?: string;
    items: RegisterSaleItemDTO[];
    payments: RegisterSalePaymentDTO[];
}
