import { ISaleRepository } from "../../domain/repositories/ISaleRepository";
import { Sale } from "../../domain/entities/Sale";
import { SaleItem } from "../../domain/entities/SaleItem";
import { SalePayment, PaymentMethod } from "../../domain/entities/SalePayment";
import { prisma } from "../database/prismaClient";

export class PrismaSaleRepository implements ISaleRepository {
    public async findById(tenantId: string, id: string): Promise<Sale | null> {
        const data = await prisma.sale.findFirst({
            where: {
                id,
                tenantId,
            },
            include: {
                items: true,
                payments: true,
            },
        });

        if (!data) return null;

        const items = data.items.map((item) =>
            SaleItem.create(
                item.id,
                item.tenantId,
                item.saleId,
                item.productId,
                item.quantity,
                Number(item.price),
                item.createdAt,
                item.updatedAt
            )
        );

        const payments = data.payments.map((payment) =>
            SalePayment.create(
                payment.id,
                payment.tenantId,
                payment.saleId,
                Number(payment.amount),
                payment.method as PaymentMethod,
                payment.createdAt,
                payment.updatedAt
            )
        );

        return Sale.create(
            data.id,
            data.tenantId,
            data.userId,
            data.customerId,
            data.sessionId,
            Number(data.totalAmount),
            data.createdAt,
            data.updatedAt,
            items,
            payments
        );
    }

    public async findAll(tenantId: string): Promise<Sale[]> {
        const data = await prisma.sale.findMany({
            where: { tenantId },
            include: { items: true, payments: true },
        });

        return data.map((d) => {
            const items = d.items.map((item) =>
                SaleItem.create(
                    item.id,
                    item.tenantId,
                    item.saleId,
                    item.productId,
                    item.quantity,
                    Number(item.price),
                    item.createdAt,
                    item.updatedAt
                )
            );

            const payments = d.payments.map((payment) =>
                SalePayment.create(
                    payment.id,
                    payment.tenantId,
                    payment.saleId,
                    Number(payment.amount),
                    payment.method as PaymentMethod,
                    payment.createdAt,
                    payment.updatedAt
                )
            );

            return Sale.create(
                d.id,
                d.tenantId,
                d.userId,
                d.customerId,
                d.sessionId,
                Number(d.totalAmount),
                d.createdAt,
                d.updatedAt,
                items,
                payments
            );
        });
    }

    public async findSalesByDate(tenantId: string, date: Date): Promise<Sale[]> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const data = await prisma.sale.findMany({
            where: {
                tenantId,
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: { items: true, payments: true },
        });

        return data.map((d) => {
            const items = d.items.map((item) =>
                SaleItem.create(
                    item.id,
                    item.tenantId,
                    item.saleId,
                    item.productId,
                    item.quantity,
                    Number(item.price),
                    item.createdAt,
                    item.updatedAt
                )
            );

            const payments = d.payments.map((payment) =>
                SalePayment.create(
                    payment.id,
                    payment.tenantId,
                    payment.saleId,
                    Number(payment.amount),
                    payment.method as PaymentMethod,
                    payment.createdAt,
                    payment.updatedAt
                )
            );

            return Sale.create(
                d.id,
                d.tenantId,
                d.userId,
                d.customerId,
                d.sessionId,
                Number(d.totalAmount),
                d.createdAt,
                d.updatedAt,
                items,
                payments
            );
        });
    }

    public async findSalesBySessionId(tenantId: string, sessionId: string): Promise<Sale[]> {
        const data = await prisma.sale.findMany({
            where: {
                tenantId,
                sessionId,
            },
            include: { items: true, payments: true },
        });

        return data.map((d) => {
            const items = d.items.map((item) =>
                SaleItem.create(
                    item.id,
                    item.tenantId,
                    item.saleId,
                    item.productId,
                    item.quantity,
                    Number(item.price),
                    item.createdAt,
                    item.updatedAt
                )
            );

            const payments = d.payments.map((payment) =>
                SalePayment.create(
                    payment.id,
                    payment.tenantId,
                    payment.saleId,
                    Number(payment.amount),
                    payment.method as PaymentMethod,
                    payment.createdAt,
                    payment.updatedAt
                )
            );

            return Sale.create(
                d.id,
                d.tenantId,
                d.userId,
                d.customerId,
                d.sessionId,
                Number(d.totalAmount),
                d.createdAt,
                d.updatedAt,
                items,
                payments
            );
        });
    }

    public async getDailySalesAggregated(tenantId: string, startDate: Date, endDate: Date): Promise<{ totalAmount: number; breakdown: { method: string; amount: number }[]; cashiers: { name: string; amount: number }[] }> {
        // En español: Ejecutamos agregaciones directas apuntando a Prisma para aligerar la carga de memoria en el servidor Node.
        // Sumamos el total de venta en cabeceras.
        const totalAgg = await prisma.sale.aggregate({
            _sum: {
                totalAmount: true
            },
            where: {
                tenantId,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        // En español: Agrupamos los pagos para obtener el desglose por método en la misma franja de tiempo
        const paymentBreakdown = await prisma.salePayment.groupBy({
            by: ['method'],
            _sum: {
                amount: true
            },
            where: {
                tenantId,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        const breakdown = paymentBreakdown.map((item) => ({
            method: item.method as string,
            amount: item._sum.amount ? Number(item._sum.amount) : 0
        }));

        // Agrupamos las ventas por userId para obtener el desglose de lo que vendió cada cajero
        const salesByCashier = await prisma.sale.groupBy({
            by: ['userId'],
            _sum: {
                totalAmount: true
            },
            where: {
                tenantId,
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            }
        });

        // Hacemos el mapeo manual para buscar el nombre real de cada userId
        const cashierData = [];
        for (const sal_cashier of salesByCashier) {
            const user = await prisma.user.findFirst({
                where: { id: sal_cashier.userId },
                include: { employee: true }
            });
            const amount = sal_cashier._sum.totalAmount ? Number(sal_cashier._sum.totalAmount) : 0;
            const name = user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : (user?.email || 'Desconocido');

            cashierData.push({ name, amount });
        }

        // Ordenamos descendente por total vendido
        cashierData.sort((a, b) => b.amount - a.amount);

        return {
            totalAmount: totalAgg._sum.totalAmount ? Number(totalAgg._sum.totalAmount) : 0,
            breakdown,
            cashiers: cashierData
        };
    }

    public async create(tenantId: string, sale: Sale): Promise<void> {
        await prisma.sale.create({
            data: {
                id: sale.id,
                tenantId,
                userId: sale.userId,
                customerId: sale.customerId,
                sessionId: sale.sessionId,
                totalAmount: sale.totalAmount,
                createdAt: sale.createdAt,
                updatedAt: sale.updatedAt,
                items: {
                    create: sale.items.map((item) => ({
                        id: item.id,
                        tenantId: item.tenantId,
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                        createdAt: item.createdAt,
                        updatedAt: item.updatedAt,
                    })),
                },
                payments: {
                    create: sale.payments.map((payment) => ({
                        id: payment.id,
                        tenantId: payment.tenantId,
                        amount: payment.amount,
                        method: payment.method as any,
                        createdAt: payment.createdAt,
                        updatedAt: payment.updatedAt,
                    })),
                },
            },
        });
    }

    public async saveBulk(tenantId: string, sales: Sale[]): Promise<void> {
        // En español: Transacción de Prisma para sincronización masiva offline. 
        // Si la inserción de una venta falla, Prisma aborta todas para evitar inconsistencia.
        const operations = sales.map((sale) => {
            return prisma.sale.create({
                data: {
                    id: sale.id,
                    tenantId,
                    userId: sale.userId,
                    customerId: sale.customerId,
                    sessionId: sale.sessionId,
                    totalAmount: sale.totalAmount,
                    createdAt: sale.createdAt,
                    updatedAt: sale.updatedAt,
                    items: {
                        create: sale.items.map((item) => ({
                            id: item.id,
                            tenantId: item.tenantId,
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            createdAt: item.createdAt,
                            updatedAt: item.updatedAt,
                        })),
                    },
                    payments: {
                        create: sale.payments.map((payment) => ({
                            id: payment.id,
                            tenantId: payment.tenantId,
                            amount: payment.amount,
                            method: payment.method as any,
                            createdAt: payment.createdAt,
                            updatedAt: payment.updatedAt,
                        })),
                    },
                },
            });
        });

        await prisma.$transaction(operations);
    }

    public async update(tenantId: string, sale: Sale): Promise<void> {
        const exists = await prisma.sale.findFirst({
            where: { id: sale.id, tenantId },
        });

        if (!exists) {
            throw new Error(`Venta no encontrada para actualizar: ${sale.id}`);
        }

        await prisma.$transaction([
            prisma.saleItem.deleteMany({
                where: { saleId: sale.id, tenantId },
            }),
            prisma.salePayment.deleteMany({
                where: { saleId: sale.id, tenantId },
            }),
            prisma.sale.update({
                where: { id: sale.id },
                data: {
                    totalAmount: sale.totalAmount,
                    updatedAt: new Date(),
                    items: {
                        create: sale.items.map((item) => ({
                            id: item.id,
                            tenantId: item.tenantId,
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price,
                            createdAt: item.createdAt,
                            updatedAt: new Date(),
                        })),
                    },
                    payments: {
                        create: sale.payments.map((payment) => ({
                            id: payment.id,
                            tenantId: payment.tenantId,
                            amount: payment.amount,
                            method: payment.method as any,
                            createdAt: payment.createdAt,
                            updatedAt: new Date(),
                        })),
                    },
                },
            }),
        ]);
    }

    public async delete(tenantId: string, id: string): Promise<void> {
        const exists = await prisma.sale.findFirst({
            where: { id, tenantId },
        });

        if (!exists) {
            throw new Error(`Venta no encontrada para eliminar: ${id}`);
        }

        await prisma.sale.delete({
            where: { id },
        });
    }
}
