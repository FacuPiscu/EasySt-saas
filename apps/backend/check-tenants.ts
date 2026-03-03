import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function check() {
    const tenants = await prisma.tenant.findMany();
    require('fs').writeFileSync('id.txt', tenants.map(t => t.id).join(', '));
    process.exit(0);
}

check();
