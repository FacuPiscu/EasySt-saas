import express from "express";
import cors from "cors";
import { saleRoutes } from "./routes/saleRoutes";
import { customerRoutes } from "./routes/customerRoutes";
import { tenantRoutes } from "./routes/tenantRoutes";
import { categoryRoutes } from "./routes/categoryRoutes";
import { productRoutes } from "./routes/productRoutes";
import { batchRoutes } from "./routes/batchRoutes";
import { authRoutes } from "./routes/authRoutes";
import { reportRoutes } from "./routes/reportRoutes";
import { cashRegisterRoutes } from "./routes/CashRegisterRoutes";

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/products", batchRoutes); // Mappeamos la ruta nested /products/:productId/batches directamente a la raíz API
app.use("/api/sales", saleRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/cash-register", cashRegisterRoutes);

// Punto de control de estado interno (Health check)
app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Servidor operativo." });
});

export { app };
