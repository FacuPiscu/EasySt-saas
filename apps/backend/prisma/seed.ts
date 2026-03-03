import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Starting database seed...");

    // 1. Upsert Tenant
    const tenant = await prisma.tenant.upsert({
        where: { id: "tenant-demo" },
        update: {},
        create: {
            id: "tenant-demo",
            name: "Negocio de Prueba",
            plan: "DEMO",
            isActive: true,
        },
    });
    console.log(`Created/Updated Tenant: ${tenant.name}`);

    // 2. Upsert User
    const user = await prisma.user.upsert({
        where: {
            tenantId_email: {
                tenantId: "tenant-demo",
                email: "admin@easyst.com",
            },
        },
        update: {},
        create: {
            id: "user-demo",
            tenantId: "tenant-demo",
            email: "admin@easyst.com",
            name: "Admin Demo",
            passwordHash: "dummy-hash",
            role: "ADMIN",
        },
    });
    console.log(`Created/Updated User: ${user.email}`);

    // 3. Upsert Products
    const product1 = await prisma.product.upsert({
        where: { id: "prod-coca-cola" },
        update: {},
        create: {
            id: "prod-coca-cola",
            tenantId: "tenant-demo",
            name: "Coca Cola",
            description: "Bebida Gaseosa 2L",
            price: 1500,
            reorderPoint: 10,
            batches: {
                create: [
                    { id: "batch-coca-1", barcode: "COCA001", cost: 1000, stock: 50 },
                ],
            },
        },
    });

    const product2 = await prisma.product.upsert({
        where: { id: "prod-alfajor" },
        update: {},
        create: {
            id: "prod-alfajor",
            tenantId: "tenant-demo",
            name: "Alfajor",
            description: "Alfajor de Chocolate",
            price: 800,
            reorderPoint: 5,
            batches: {
                create: [
                    { id: "batch-alfa-1", barcode: "ALFA001", cost: 500, stock: 20 },
                ],
            },
        },
    });

    console.log(`Created/Updated Products: ${product1.name}, ${product2.name}`);
    console.log("Database seed completed successfully.");
}

main()
    .catch((e) => {
        console.error("Error during seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
