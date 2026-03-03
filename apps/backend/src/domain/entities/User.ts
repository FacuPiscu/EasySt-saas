export type Role = 'ADMIN' | 'CASHIER';

export class User {
    constructor(
        public readonly id: string,
        public readonly tenantId: string,
        public email: string,
        public passwordHash: string,
        public name: string,
        public role: Role,
        public readonly createdAt: Date,
        public updatedAt: Date
    ) { }

    public isAdmin(): boolean {
        return this.role === 'ADMIN';
    }

    public isCashier(): boolean {
        return this.role === 'CASHIER';
    }

    static create(
        id: string,
        tenantId: string,
        email: string,
        passwordHash: string,
        name: string,
        role: Role,
        createdAt: Date,
        updatedAt: Date
    ): User {
        return new User(id, tenantId, email, passwordHash, name, role, createdAt, updatedAt);
    }
}