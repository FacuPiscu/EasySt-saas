import "dotenv/config";
import { app } from "./presentation/server";
import { prisma } from "./infrastructure/database/prismaClient";

const PORT = process.env.PORT || 3001;

async function bootstrap() {
    try {
        await prisma.$connect();
        console.log("Database connected successfully.");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

bootstrap();
