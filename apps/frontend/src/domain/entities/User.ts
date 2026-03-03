export type Role = 'ADMIN' | 'CASHIER';

export interface User {
    id: string;
    tenantId: string;
    name: string;
    email: string;
    role: Role;
}
