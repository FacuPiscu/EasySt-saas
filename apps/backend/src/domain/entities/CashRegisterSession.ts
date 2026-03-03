export type SessionStatus = 'OPEN' | 'CLOSED';

export class CashRegisterSession {
    constructor(
        public readonly id: string,
        public readonly tenantId: string,
        public readonly userId: string,
        public readonly startTime: Date,
        public endTime: Date | null,
        public readonly initialAmount: number,
        public declaredAmount: number | null,
        public calculatedAmount: number | null,
        public status: SessionStatus,
        public readonly createdAt: Date,
        public readonly updatedAt: Date
    ) { }

    // Cerramos la sesión calculando si el dinero físico cuenta coincide con lo retenido digitalmente
    public close(declaredAmount: number, calculatedAmount: number): void {
        if (this.status === 'CLOSED') {
            throw new Error("La caja ya se encuentra cerrada.");
        }

        this.endTime = new Date();
        this.status = 'CLOSED';
        this.declaredAmount = declaredAmount;
        this.calculatedAmount = calculatedAmount;
    }

    static create(
        id: string,
        tenantId: string,
        userId: string,
        startTime: Date,
        endTime: Date | null,
        initialAmount: number,
        declaredAmount: number | null,
        calculatedAmount: number | null,
        status: SessionStatus,
        createdAt: Date,
        updatedAt: Date
    ): CashRegisterSession {
        return new CashRegisterSession(
            id, tenantId, userId, startTime, endTime, initialAmount, declaredAmount, calculatedAmount, status, createdAt, updatedAt
        );
    }
}
