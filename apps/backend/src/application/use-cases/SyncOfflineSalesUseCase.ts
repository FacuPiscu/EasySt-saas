import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { ISaleRepository } from "../../domain/repositories/ISaleRepository";
import { ICashRegisterSessionRepository } from "../../domain/repositories/ICashRegisterSessionRepository";
import { SyncSaleDTO, SyncSaleItemDTO, SyncSalePaymentDTO } from "../dtos/SyncSaleDTO";
import { Sale } from "../../domain/entities/Sale";
import { SaleItem } from "../../domain/entities/SaleItem";
import { SalePayment, PaymentMethod } from "../../domain/entities/SalePayment";
import { Product } from "../../domain/entities/Product";

export class SyncOfflineSalesUseCase {
    constructor(
        private readonly productRepository: IProductRepository,
        private readonly saleRepository: ISaleRepository,
        private readonly sessionRepository: ICashRegisterSessionRepository
    ) { }

    public async execute(tenantId: string, userId: string, salesDto: SyncSaleDTO[]): Promise<{ syncedCount: number }> {
        const openSession = await this.sessionRepository.findOpenSessionByUserId(tenantId, userId);

        if (!openSession) {
            throw new Error("Debe tener un turno de caja abierto para poder sincronizar las ventas offline.");
        }

        const salesToSave: Sale[] = [];
        const productsUpdated = new Map<string, Product>();
        const now = new Date();

        for (const dto of salesDto) {
            let totalAmount = 0;
            const saleItems: SaleItem[] = [];

            for (const itemDto of dto.items) {
                let product: Product | null | undefined = productsUpdated.get(itemDto.productId);

                if (!product) {
                    product = await this.productRepository.findById(tenantId, itemDto.productId);
                    if (!product) {
                        throw new Error(`Producto no encontrado durante la sincronización: ${itemDto.productId}`);
                    }
                }

                // Disminuye el stock. Ya soporta stock negativo, así que no lanzará error por eso.
                product.decreaseStock(itemDto.quantity, itemDto.barcode);
                productsUpdated.set(product.id, product);

                const itemTotal = product.price * itemDto.quantity;
                totalAmount += itemTotal;

                saleItems.push(SaleItem.create(
                    itemDto.id,
                    tenantId,
                    dto.id,
                    product.id,
                    itemDto.quantity,
                    product.price,
                    now,
                    now
                ));
            }

            const paymentsItems: SalePayment[] = dto.payments.map(p => SalePayment.create(
                p.id,
                tenantId,
                dto.id,
                p.amount,
                p.method as PaymentMethod,
                now,
                now
            ));

            const sale = Sale.create(
                dto.id,
                tenantId,
                userId,
                dto.customerId || null,
                openSession.id,
                totalAmount,
                now,
                now,
                saleItems,
                paymentsItems
            );

            // Validamos que los montos de pago cubran el total de la venta offline
            sale.validatePaymentsAmount();
            salesToSave.push(sale);
        }

        // En español: Transacción de Base de Datos para inserción masiva. Si alguna venta es inválida, ninguna se guardará.
        await this.saleRepository.saveBulk(tenantId, salesToSave);

        for (const product of productsUpdated.values()) {
            await this.productRepository.update(tenantId, product);
        }

        return { syncedCount: salesToSave.length };
    }
}
