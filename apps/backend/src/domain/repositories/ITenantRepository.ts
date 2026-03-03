import { Tenant } from "../entities/Tenant";

export interface ITenantRepository {
    findById(id: string): Promise<Tenant | null>;
    create(tenant: Tenant): Promise<void>;
    update(tenant: Tenant): Promise<void>;
    delete(id: string): Promise<void>;
}
