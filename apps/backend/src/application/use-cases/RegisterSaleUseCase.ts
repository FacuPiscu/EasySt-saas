import { randomUUID } from "crypto";
import { RegisterSaleDTO } from "../dtos/RegisterSaleDTO";
import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { ISaleRepository } from "../../domain/repositories/ISaleRepository";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { ICustomerRepository } from "../../domain/repositories/ICustomerRepository";
import { ICashRegisterSessionRepository } from "../../domain/repositories/ICashRegisterSessionRepository";
import { Sale } from "../../domain/entities/Sale";
import { SaleItem } from "../../domain/entities/SaleItem";
import { SalePayment } from "../../domain/entities/SalePayment";
import { Product } from "../../domain/entities/Product";

export class RegisterSaleUseCase {
    constructor(
        private readonly productRepository: IProductRepository,
        private readonly saleRepository: ISaleRepository,
        private readonly userRepository: IUserRepository,
        private readonly customerRepository: ICustomerRepository,
        private readonly sessionRepository: ICashRegisterSessionRepository
    ) { }

    public async execute(dto: RegisterSaleDTO): Promise<Sale> {
        const { tenantId, userId, customerId, items, payments } = dto;

        const user = await this.userRepository.findById(tenantId, userId);
        if (!user) {
            throw new Error("Usuario no encontrado.");
        }

        const openSession = await this.sessionRepository.findOpenSessionByUserId(tenantId, userId);
        if (!openSession) {
            throw new Error("Debe abrir la caja antes de registrar una venta.");
        }

        if (customerId) {
            const customer = await this.customerRepository.findById(tenantId, customerId);
            if (!customer) {
                throw new Error("Cliente no encontrado.");
            }
        }

        if (!items || items.length === 0) {
            throw new Error("La venta no puede registrarse sin productos.");
        }

        if (!payments || payments.length === 0) {
            throw new Error("La venta no puede registrarse sin pagos.");
        }

        let totalAmount = 0;
        const saleId = randomUUID();
        const now = new Date();
        const productsToUpdate: Product[] = [];
        const saleItems: SaleItem[] = [];

        for (const itemDto of items) {
            const product = await this.productRepository.findById(tenantId, itemDto.productId);

            if (!product) {
                throw new Error(`Producto no encontrado con el código interno: ${itemDto.productId}`);
            }

            product.decreaseStock(itemDto.quantity, itemDto.barcode);
            productsToUpdate.push(product);

            const itemTotal = product.price * itemDto.quantity;
            totalAmount += itemTotal;

            const saleItem = SaleItem.create(
                randomUUID(),
                tenantId,
                saleId,
                product.id,
                itemDto.quantity,
                product.price,
                now,
                now
            );

            saleItems.push(saleItem);
        }

        const paymentsItems: SalePayment[] = payments.map(p => SalePayment.create(
            randomUUID(),
            tenantId,
            saleId,
            p.amount,
            p.method,
            now,
            now
        ));

        const sale = Sale.create(
            saleId,
            tenantId,
            userId,
            customerId || null,
            openSession.id,
            totalAmount,
            now,
            now,
            saleItems,
            paymentsItems
        );

        sale.validatePaymentsAmount();

        await this.saleRepository.create(tenantId, sale);

        for (const product of productsToUpdate) {
            await this.productRepository.update(tenantId, product);
        }

        return sale;
    }
}
