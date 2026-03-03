import { randomUUID } from "crypto";
import { Batch } from "./Batch";

export class Product {
    constructor(
        public readonly id: string,
        public readonly tenantId: string,
        public readonly categoryId: string | null,
        public name: string,
        public description: string | null,
        public price: number,
        public reorderPoint: number,
        public readonly createdAt: Date,
        public updatedAt: Date,
        public batches: Batch[] = []
    ) { }

    public getTotalStock(): number {
        return this.batches.reduce((total, batch) => total + batch.stock, 0);
    }

    public decreaseStock(quantity: number, barcode?: string): void {
        if (quantity <= 0) {
            throw new Error("La cantidad a disminuir debe ser mayor a cero.");
        }

        // Resolviendo el barcode por defecto para lotes virtuales si el cliente no lo envía
        const finalBarcode = barcode || "VIRTUAL-NEGATIVE";

        const batch = this.batches.find(b => b.barcode === finalBarcode);

        if (batch) {
            batch.decreaseStock(quantity);
        } else {
            // Se genera un lote con stock negativo debido a que existe una venta sin ingreso previo de mercadería
            const now = new Date();
            const newBatch = Batch.create(
                randomUUID(),
                this.id,
                finalBarcode,
                0,
                -quantity,
                null,
                now,
                now
            );
            this.batches.push(newBatch);
        }
    }

    public needsRestock(): boolean {
        return this.getTotalStock() <= this.reorderPoint;
    }

    static create(
        id: string,
        tenantId: string,
        categoryId: string | null,
        name: string,
        description: string | null,
        price: number,
        reorderPoint: number,
        createdAt: Date,
        updatedAt: Date,
        batches: Batch[] = []
    ): Product {
        return new Product(id, tenantId, categoryId, name, description, price, reorderPoint, createdAt, updatedAt, batches);
    }
}
