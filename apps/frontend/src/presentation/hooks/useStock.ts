import { useState, useEffect } from 'react';
import { apiClient } from '../../infrastructure/api/apiClient';
import * as XLSX from 'xlsx';

export interface Batch {
    id?: string;
    barcode: string;
    cost: number;
    stock: number;
    expirationDate: string | null;
}

export interface Product {
    id?: string;
    name: string;
    description: string;
    price: number;
    reorderPoint: number;
    batches: Batch[];
}

export const useStock = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [importLogs, setImportLogs] = useState<string[]>([]);

    // Estado para importación en caliente
    const [pendingImport, setPendingImport] = useState<Product[] | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importTimeout, setImportTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const data = await apiClient.get('/products');
            setProducts(data);
        } catch (error) {
            console.error('Error al obtener el inventario:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Calcula el total de stock sumando los lotes
    const getTotalStock = (product: Product) => {
        return product.batches.reduce((total, batch) => total + batch.stock, 0);
    };

    const isLowStock = (product: Product) => {
        return getTotalStock(product) <= product.reorderPoint;
    };

    // Alerta de fechas de vencimiento a 30 días
    const getExpiringBatches = (product: Product) => {
        const today = new Date();
        const thirtyDays = new Date(today);
        thirtyDays.setDate(today.getDate() + 30);

        return product.batches.filter(batch => {
            if (!batch.expirationDate) return false;
            const expDate = new Date(batch.expirationDate);
            return expDate <= thirtyDays;
        });
    };

    const parseNumber = (val: any): number => {
        if (typeof val === 'number') return isNaN(val) ? 0 : val;
        if (!val) return 0;
        const s = String(val).replace(/[^0-9.,-]/g, '');
        const lastComma = s.lastIndexOf(',');
        const lastDot = s.lastIndexOf('.');
        let numStr = s;
        if (lastComma > -1 && lastDot > -1) {
            numStr = lastComma > lastDot ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
        } else if (lastComma > -1) {
            numStr = s.replace(/\./g, '').replace(',', '.');
        }
        const parsed = Number(numStr);
        return isNaN(parsed) ? 0 : parsed;
    };

    const parseExcel = async (files: FileList) => {
        if (files.length === 0) return;
        const file = files[0];
        setImportLogs([`Analizando archivo: ${file.name}...`]);

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet);

            const parsedProductsMap = new Map<string, Product>();
            const originalBatchesMap = new Map<string, Batch[]>();

            // Precargar productos que ya existen en la DB al mapa local
            products.forEach(p => {
                const productKey = p.name.trim().toLowerCase();
                parsedProductsMap.set(productKey, {
                    ...p,
                    batches: [] // Iniciamos en vacío la prop de lotes a actualizar
                });
                originalBatchesMap.set(productKey, p.batches || []);
            });

            for (const originalRow of json) {
                // Normalizar claves del registro (todo a minúsculas, sin espacios)
                const row: any = {};
                for (const key in originalRow) {
                    row[key.toLowerCase().trim()] = originalRow[key];
                }

                const nombre = row.nombre || row.name || row.producto;
                const precio = row.precio || row.price;

                if (!nombre || precio === undefined) continue;

                const productName = String(nombre).trim();
                const productKey = productName.toLowerCase();

                let product = parsedProductsMap.get(productKey);

                if (!product) {
                    product = {
                        name: productName,
                        price: parseNumber(precio),
                        description: row.descripcion || row.description || '',
                        reorderPoint: parseNumber(row.puntorestock || row['punto restock'] || row.reorderpoint),
                        batches: []
                    };
                    parsedProductsMap.set(productKey, product);
                    originalBatchesMap.set(productKey, []);
                } else {
                    if (!product.batches) product.batches = [];
                }

                const stock = row.stock !== undefined ? row.stock : row.cantidad;
                const rawBarcode = row.codigobarras || row['codigo barras'] || row.barcode;
                const codigoBarras = rawBarcode ? String(rawBarcode).trim() : 'GENERICO';

                if (stock !== undefined || rawBarcode) {
                    const newStock = parseNumber(stock);
                    const newCost = parseNumber(row.costo || row.cost);
                    const newExpiration = (row.vencimiento || row.expiration) ? new Date(row.vencimiento || row.expiration).toISOString() : null;

                    // 1. Ver si YA LO AGREGAMOS en ESTE MISMO excel (Duplicado en la misma hoja)
                    const existingInPayload = product.batches.find(b => b.barcode === codigoBarras && codigoBarras !== 'GENERICO');

                    if (existingInPayload) {
                        existingInPayload.stock += newStock; // Sumar stock de filas duplicadas en el excel
                        if (newExpiration) existingInPayload.expirationDate = newExpiration;
                        if (newCost > 0) existingInPayload.cost = newCost;
                    } else {
                        // 2. Ver si EXISTÍA en la BASE DE DATOS antes de importar
                        const dbBatches = originalBatchesMap.get(productKey) || [];
                        const existingInDb = dbBatches.find(b => b.barcode === codigoBarras && codigoBarras !== 'GENERICO');

                        product.batches.push({
                            id: existingInDb ? existingInDb.id : undefined, // Magia: Si existe le pasamos su ID para que Prisma lo actualice en vez de duplicarlo!
                            barcode: codigoBarras,
                            cost: newCost,
                            stock: newStock, // Pisar el stock con el valor del Excel
                            expirationDate: newExpiration
                        });
                    }
                }
            }

            const finalPayload = Array.from(parsedProductsMap.values()).filter(p => !p.id || p.batches.length > 0);

            setPendingImport(finalPayload);
            setImportLogs(prev => [...prev, `[+] Archivo analizado correctamente. Se detectaron ${finalPayload.length} productos a procesar.`]);
        } catch (err: any) {
            setImportLogs(prev => [...prev, `[X] Error crítico leyendo el archivo: ${err.message}`]);
        }
    };

    const confirmImport = () => {
        if (!pendingImport) return;

        setIsImporting(true);
        setImportLogs(prev => [...prev, ` Preparando importación de ${pendingImport.length} items... (Puedes cancelar aún)`]);

        const timeout = setTimeout(async () => {
            setImportLogs(prev => [...prev, ` Ejecutando carga masiva en servidor...`]);
            try {
                await apiClient.post('/products/bulk-import', { products: pendingImport });
                setImportLogs(prev => [...prev, `[+] ¡Carga masiva completada exitosamente!`]);
                setPendingImport(null);

                // Refrescar estado total de la base de datos
                await fetchProducts();

                // Limpiar logs después de 3 segundos
                setTimeout(() => setImportLogs([]), 3500);

            } catch (err: any) {
                setImportLogs(prev => [...prev, `[X] Falló la transacción. Se realizó un rollback: ${err.message}`]);
            } finally {
                setIsImporting(false);
            }
        }, 3000);

        setImportTimeout(timeout);
    };

    const cancelImport = () => {
        if (importTimeout) clearTimeout(importTimeout);
        setIsImporting(false);
        setPendingImport(null);
        setImportLogs(prev => [...prev, ` Importación Abortada. El estado de la base de datos permanece inalterado.`]);
    };

    return {
        products, isLoading,
        importLogs, getTotalStock, isLowStock, getExpiringBatches,
        parseExcel, confirmImport, cancelImport, pendingImport, isImporting
    };
};
