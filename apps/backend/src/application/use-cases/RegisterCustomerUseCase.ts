import { randomUUID } from "crypto";
import { RegisterCustomerDTO } from "../dtos/RegisterCustomerDTO";
import { ICustomerRepository } from "../../domain/repositories/ICustomerRepository";
import { Customer } from "../../domain/entities/Customer";

export class RegisterCustomerUseCase {
    constructor(private readonly customerRepository: ICustomerRepository) { }

    public async execute(dto: RegisterCustomerDTO): Promise<Customer> {
        const { tenantId, name, dni } = dto;

        // Verificar si el DNI ya existe para este tenant
        const existingCustomer = await this.customerRepository.findByDNI(tenantId, dni);
        if (existingCustomer) {
            throw new Error("El DNI ya se encuentra registrado en este negocio.");
        }

        const now = new Date();
        const customerId = randomUUID();

        const customer = Customer.create(
            customerId,
            tenantId,
            name,
            dni,
            now,
            now
        );

        await this.customerRepository.create(tenantId, customer);

        return customer;
    }
}
