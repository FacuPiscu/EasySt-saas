export class Tenant {
    constructor(
        public readonly id: string,
        public name: string,
        public plan: string,
        public isActive: boolean,
        public readonly createdAt: Date,
        public updatedAt: Date
    ) { }

    static create(id: string, name: string, plan: string, isActive: boolean, createdAt: Date, updatedAt: Date): Tenant {
        return new Tenant(id, name, plan, isActive, createdAt, updatedAt);
    }
}
