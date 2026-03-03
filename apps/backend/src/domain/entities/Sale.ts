import { SaleItem } from "./SaleItem";
import { SalePayment } from "./SalePayment";

export class Sale {
    constructor(
        public readonly id: string,
        public readonly tenantId: string,
        public readonly userId: string,
        public readonly customerId: string | null,
        public readonly sessionId: string | null,
        public totalAmount: number,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
        public readonly items: SaleItem[] = [],
        public readonly payments: SalePayment[] = []
    ) { }

    public validatePaymentsAmount(): void {
        const totalPayments = this.payments.reduce((sum, p) => sum + p.amount, 0);
        // Validar que la suma de los pagos coincida con el total de la venta
        if (totalPayments !== this.totalAmount) {
            throw new Error("El total de los pagos no coincide con el total de la venta");
        }
    }

    static create(
        id: string,
        tenantId: string,
        userId: string,
        customerId: string | null,
        sessionId: string | null,
        totalAmount: number,
        createdAt: Date,
        updatedAt: Date,
        items: SaleItem[] = [],
        payments: SalePayment[] = []
    ): Sale {
        return new Sale(id, tenantId, userId, customerId, sessionId, totalAmount, createdAt, updatedAt, items, payments);
    }
}
