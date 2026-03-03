import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { BulkImportProductsUseCase } from "./src/application/use-cases/BulkImportProductsUseCase";
import { PrismaProductRepository } from "./src/infrastructure/repositories/PrismaProductRepository";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 20 });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const repo = new PrismaProductRepository();
const useCase = new BulkImportProductsUseCase(repo);

async function test() {
    try {
        const payload = Array.from({ length: 50 }).map((_, i) => ({
            name: "Coca test " + i,
            price: 150,
            reorderPoint: 5,
            batches: [
                {
                    barcode: "123" + i,
                    cost: 100,
                    stock: 50,
                    expirationDate: "2024-12-31"
                }
            ]
        }));
        await useCase.execute("1d2c8bc7-23a9-481d-a6cc-b6762bee20cc", payload);
        console.log("Success!");
    } catch (e: any) {
        console.error("FAILED:", e.message || e);
    }
}

test();
