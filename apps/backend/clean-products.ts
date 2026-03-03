import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function cleanDB() {
    try {
        console.log("Limpiando TABLAS DE VENTAS (dependencias)...");
        await prisma.salePayment.deleteMany({});
        await prisma.saleItem.deleteMany({});
        await prisma.sale.deleteMany({});

        console.log("Limpiando BATCHES...");
        await prisma.batch.deleteMany({});

        console.log("Limpiando PRODUCTOS...");
        await prisma.product.deleteMany({});

        console.log("Base de datos limpia de productos!");
    } catch (e: any) {
        console.error(e.message || e);
    } finally {
        await prisma.$disconnect();
    }
}

cleanDB();
