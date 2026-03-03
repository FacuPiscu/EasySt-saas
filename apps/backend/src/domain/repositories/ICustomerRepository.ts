import { Customer } from "../entities/Customer";

export interface ICustomerRepository {
    findById(tenantId: string, id: string): Promise<Customer | null>;
    findByDNI(tenantId: string, dni: string): Promise<Customer | null>;
    findAll(tenantId: string): Promise<Customer[]>;
    create(tenantId: string, customer: Customer): Promise<void>;
    update(tenantId: string, customer: Customer): Promise<void>;
    delete(tenantId: string, id: string): Promise<void>;
}
