export class Batch {
    constructor(
        public readonly id: string,
        public readonly productId: string,
        public barcode: string,
        public cost: number,
        public stock: number,
        public expirationDate: Date | null,
        public readonly createdAt: Date,
        public updatedAt: Date
    ) { }

    public decreaseStock(quantity: number): void {
        if (quantity <= 0) {
            throw new Error("La cantidad a disminuir debe ser mayor a cero.");
        }

        // Se permite que el stock quede en negativo (ventas sin stock físico comprobado)
        this.stock -= quantity;
    }

    public isExpired(): boolean {
        if (!this.expirationDate) return false;
        return this.expirationDate.getTime() < new Date().getTime();
    }

    static create(
        id: string,
        productId: string,
        barcode: string,
        cost: number,
        stock: number,
        expirationDate: Date | null,
        createdAt: Date,
        updatedAt: Date
    ): Batch {
        return new Batch(id, productId, barcode, cost, stock, expirationDate, createdAt, updatedAt);
    }
}
