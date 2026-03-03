import React, { useRef, useState } from 'react';
import { useStock, type Product } from '../../../hooks/useStock';
import styles from './StockPage.module.css';

export const StockPage: React.FC = () => {
    const {
        products, isLoading, importLogs,
        getTotalStock, isLowStock, getExpiringBatches,
        parseExcel, confirmImport, cancelImport, pendingImport, isImporting
    } = useStock();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            parseExcel(e.target.files);
            // Resetear el input
            e.target.value = '';
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Sin Vencimiento';
        return new Date(dateString).toLocaleDateString('es-AR', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerTitle}>
                    <h1>Inventario y Stock</h1>
                    <p>Administra los productos de tu sucursal y verifica los estados críticos.</p>
                </div>
                <div className={styles.headerActions}>
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        multiple
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        onChange={handleFileUpload}
                        disabled={!!pendingImport}
                    />
                    <button className={styles.primaryButton} onClick={triggerFileSelect} disabled={!!pendingImport}>
                        Importar Excel (Masivo)
                    </button>
                    <button className={styles.secondaryButton} disabled={!!pendingImport}>Nuevo Producto</button>
                </div>
            </header>

            {/* Panel de Confirmacion de Importación en Caliente */}
            {pendingImport && (
                <div className={styles.importConfirmPanel}>
                    <div className={styles.confirmHeader}>
                        <h3>⚠️ Confirmar Importación Masiva</h3>
                        <p>Se detectaron {pendingImport.length} productos con actualizaciones de lotes. La operación sobreescribirá el stock de forma simultánea. ¡Esta acción es irreversible!</p>
                    </div>
                    <div className={styles.confirmActions}>
                        <button className={styles.cancelButton} onClick={cancelImport}>Cancelar Carga</button>
                        <button
                            className={styles.confirmButton}
                            onClick={confirmImport}
                            disabled={isImporting}
                            style={isImporting ? { opacity: 0.7, cursor: 'not-allowed' } : {}}
                        >
                            {isImporting ? 'Cargando importación...' : `Aceptar e Importar los ${pendingImport.length} Items`}
                        </button>
                    </div>
                </div>
            )}

            {/* Panel de Importación (Solo visible cuando hay logs activos) */}
            {importLogs.length > 0 && !pendingImport && (
                <div className={styles.importPanel}>
                    <div className={styles.importPanelHeader}>
                        <h3>Progreso de Operaciones</h3>
                    </div>
                    <ul className={styles.logList}>
                        {importLogs.map((log, idx) => (
                            <li key={idx}>{log}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Tabla de Productos */}
            <div className={styles.tableContainer}>
                {isLoading ? (
                    <div className={styles.loadingState}>Cargando catálogo...</div>
                ) : products.length === 0 ? (
                    <div className={styles.emptyState}>No hay productos en el inventario. Sube un archivo Excel para comenzar.</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Precio Venta</th>
                                <th>Stock Actual</th>
                                <th>Lotes Próximos a Vencer</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((product: Product) => {
                                const stockTotal = getTotalStock(product);
                                const isCritical = isLowStock(product);
                                const expirations = getExpiringBatches(product);

                                return (
                                    <tr key={product.id} className={styles.clickableRow} onClick={() => setSelectedProduct(product)}>
                                        <td className={styles.primaryCell}>{product.name}</td>
                                        <td>{formatCurrency(product.price)}</td>
                                        <td><strong>{stockTotal}</strong> unid.</td>
                                        <td>
                                            {expirations.length > 0 ? (
                                                <span className={styles.warningText}>
                                                    {expirations.length} lote(s) al límite
                                                </span>
                                            ) : (
                                                <span className={styles.okText}>Todo en orden</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`${styles.badge} ${isCritical ? styles.badgeDanger : styles.badgeSuccess}`}>
                                                {isCritical ? 'CRITICO' : 'DISPONIBLE'}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal de Detalle de Lotes */}
            {selectedProduct && (
                <div className={styles.modalOverlay} onClick={() => setSelectedProduct(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{selectedProduct.name}</h2>
                        </div>

                        <div className={styles.modalBody}>
                            <h3>Lotes Activos ({selectedProduct.batches.length})</h3>
                            {selectedProduct.batches.length === 0 ? (
                                <p className={styles.emptyState}>Este producto no tiene lotes ingresados aún.</p>
                            ) : (
                                <div className={styles.batchesList}>
                                    {selectedProduct.batches.map((batch, index) => {
                                        // Verificar si expira pronto para pintarlo
                                        const today = new Date();
                                        const thirtyDays = new Date(today);
                                        thirtyDays.setDate(today.getDate() + 30);
                                        const isExpiring = batch.expirationDate && new Date(batch.expirationDate) <= thirtyDays;

                                        return (
                                            <div key={batch.id || index} className={`${styles.batchCard} ${isExpiring ? styles.batchCardWarning : ''}`}>
                                                <div className={styles.batchInfo}>
                                                    <strong>Código:</strong> {batch.barcode}
                                                </div>
                                                <div className={styles.batchInfo}>
                                                    <strong>Costo de Compra:</strong> {formatCurrency(batch.cost)}
                                                </div>
                                                <div className={styles.batchInfo}>
                                                    <strong>Stock Restante:</strong> {batch.stock} unidades
                                                </div>
                                                <div className={styles.batchInfo}>
                                                    <strong>Vencimiento:</strong> {formatDate(batch.expirationDate)}
                                                </div>
                                                {isExpiring && <div className={styles.expiringTag}>⚠️ Riesgo de Vencimiento</div>}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button className={styles.secondaryButton} onClick={() => setSelectedProduct(null)}>Cerrar Panel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
