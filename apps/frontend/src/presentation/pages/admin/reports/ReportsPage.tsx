import React, { useEffect, useState } from 'react';
import styles from './ReportsPage.module.css';
import { apiClient } from '../../../../infrastructure/api/apiClient';
import { CircleDollarSign, AlertTriangle, PackageSearch, Users, ListFilter, Download, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface DailySalesData {
    totalAmount: number;
    breakdown: { method: string; amount: number }[];
    cashiers?: { name: string; amount: number }[];
}

interface RestockProduct {
    id: string;
    name: string;
    currentStock: number;
    reorderPoint: number;
}

export const ReportsPage: React.FC = () => {
    const [dailySales, setDailySales] = useState<DailySalesData | null>(null);
    const [lowStockCount, setLowStockCount] = useState<number>(0);
    const [totalProducts, setTotalProducts] = useState<number>(0);
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [activeEmployees, setActiveEmployees] = useState<number>(0);
    const [allEmployees, setAllEmployees] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Modals visibility
    const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
    const [isProductsModalOpen, setIsProductsModalOpen] = useState(false);
    const [isEmployeesModalOpen, setIsEmployeesModalOpen] = useState(false);

    // Sugerencias de reposicion
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
    const [restockList, setRestockList] = useState<RestockProduct[]>([]);
    const [isLoadingRestock, setIsLoadingRestock] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    };

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const [salesRes, lowStockRes, productsRes, employeesRes] = await Promise.all([
                apiClient.get('/reports/daily-sales').catch(() => ({ totalAmount: 0, breakdown: [] })),
                apiClient.get('/reports/low-stock').catch(() => []),
                apiClient.get('/products').catch(() => []),
                apiClient.get('/employees').catch(() => [])
            ]);

            setDailySales(salesRes);
            setLowStockCount(lowStockRes.length);
            setTotalProducts(productsRes.length || 0);

            // Almacenar listas completas para usar en los modales
            setAllProducts(productsRes || []);
            setAllEmployees(employeesRes || []);
            setActiveEmployees(employeesRes.length || 0);

        } catch (error) {
            console.error('Error fetching reports data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRestockList = async () => {
        setIsLoadingRestock(true);
        try {
            const data = await apiClient.get('/reports/restock-list');
            setRestockList(data);
        } catch (error) {
            console.error('Error fetching restock list:', error);
        } finally {
            setIsLoadingRestock(false);
        }
    };

    const handleOpenRestockModal = () => {
        setIsRestockModalOpen(true);
        fetchRestockList();
    };

    const handleExportExcel = () => {
        if (restockList.length === 0) return;

        // Preparamos datos para Excel
        const excelData = restockList.map(item => ({
            'Nombre del Producto': item.name,
            'Stock Actual': item.currentStock,
            'Punto de Reposición (Mínimo)': item.reorderPoint,
            'Cantidad a Pedir Sugerida': item.reorderPoint > item.currentStock
                ? (item.reorderPoint - item.currentStock) + Math.ceil(item.reorderPoint * 0.5) // Formula simple de sugerencia
                : 0
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        // Ajustar el ancho de las columnas
        const wscols = [
            { wch: 40 }, // Nombre
            { wch: 15 }, // Stock actual
            { wch: 25 }, // Punto reposicion
            { wch: 25 }, // Sugerencia
        ];
        worksheet['!cols'] = wscols;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sugerencias de Reposición');

        // Generar buffer y guardar
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `sugerencias_reposicion_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 className={styles.title}>Reportes Rápidos</h1>
                        <p className={styles.subtitle}>Visión general del estado actual del sistema.</p>
                    </div>
                    <button className={styles.secondaryButton} onClick={handleOpenRestockModal}>
                        <ListFilter size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                        Sugerencias de Reposición
                    </button>
                </div>
            </header>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>Cargando información...</div>
            ) : (
                <main className={styles.grid}>

                    {/* Tarjeta de Ventas Diarias */}
                    <section className={styles.card} onClick={() => setIsSalesModalOpen(true)}>
                        <div className={styles.cardHeader}>
                            <div className={`${styles.iconWrapper} ${styles.iconSales}`}>
                                <CircleDollarSign size={24} />
                            </div>
                            <h2 className={styles.cardTitle}>Ventas de Hoy</h2>
                        </div>
                        <p className={styles.cardValue}>
                            {dailySales ? formatCurrency(dailySales.totalAmount) : formatCurrency(0)}
                        </p>
                        <p className={styles.cardInfo}>
                            Facturación acumulada por cajeros.
                        </p>
                    </section>

                    {/* Tarjeta de Stock Crítico */}
                    <section className={styles.card} onClick={handleOpenRestockModal}>
                        <div className={styles.cardHeader}>
                            <div className={`${styles.iconWrapper} ${styles.iconStock}`}>
                                <AlertTriangle size={24} />
                            </div>
                            <h2 className={styles.cardTitle}>Alertas de Falta de Stock</h2>
                        </div>
                        <p className={`${styles.cardValue} ${lowStockCount > 0 ? styles.criticalValue : ''}`}>
                            {lowStockCount} items
                        </p>
                        <p className={styles.cardInfo}>
                            Productos que se quedaron sin stock.
                        </p>
                    </section>

                    {/* Tarjeta de Productos en Catálogo */}
                    <section className={styles.card} onClick={() => setIsProductsModalOpen(true)}>
                        <div className={styles.cardHeader}>
                            <div className={`${styles.iconWrapper} ${styles.iconProducts}`}>
                                <PackageSearch size={24} />
                            </div>
                            <h2 className={styles.cardTitle}>Catálogo de Productos</h2>
                        </div>
                        <p className={styles.cardValue}>
                            {totalProducts}
                        </p>
                        <p className={styles.cardInfo}>
                            Total de productos dados de alta en el sistema.
                        </p>
                    </section>

                    {/* Tarjeta de Empleados */}
                    <section className={styles.card} onClick={() => setIsEmployeesModalOpen(true)}>
                        <div className={styles.cardHeader}>
                            <div className={`${styles.iconWrapper} ${styles.iconEmployees}`}>
                                <Users size={24} />
                            </div>
                            <h2 className={styles.cardTitle}>Plantilla de Empleados</h2>
                        </div>
                        <p className={styles.cardValue}>
                            {activeEmployees}
                        </p>
                        <p className={styles.cardInfo}>
                            Total de perfiles de empleados registrados.
                        </p>
                    </section>
                </main>
            )}

            {/* Modal de Sugerencias de Reposición */}
            {isRestockModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsRestockModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2>Sugerencias de Reposición</h2>
                                <button className={styles.closeIconButton} onClick={() => setIsRestockModalOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <p className={styles.modalSubtitle}>Productos que están por debajo de su punto de reorden.</p>
                        </div>

                        <div className={styles.modalBody}>
                            {isLoadingRestock ? (
                                <div className={styles.loadingStateContent}>Analizando stock...</div>
                            ) : restockList.length === 0 ? (
                                <div className={styles.emptyStateContent}>
                                    <PackageSearch size={48} style={{ color: '#ccc', marginBottom: '1rem' }} />
                                    <p>¡Excelente! No hay productos que necesiten reposición inminente.</p>
                                </div>
                            ) : (
                                <div className={styles.restockList}>
                                    {restockList.map((item) => (
                                        <div key={item.id} className={styles.restockItem}>
                                            <div className={styles.restockItemInfo}>
                                                <strong>{item.name}</strong>
                                                <span>Stock Actual: {item.currentStock}</span>
                                            </div>
                                            <div className={styles.restockItemMeta}>
                                                <span className={styles.criticalBadge}>Mínimo esperado: {item.reorderPoint}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={styles.modalFooter}>
                            <button
                                className={styles.primaryButton}
                                onClick={handleExportExcel}
                                disabled={restockList.length === 0 || isLoadingRestock}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Download size={18} />
                                Exportar Excel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Ventas por Cajero */}
            {isSalesModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsSalesModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2>Ventas por Cajero</h2>
                                <button className={styles.closeIconButton} onClick={() => setIsSalesModalOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <p className={styles.modalSubtitle}>Ranking descendente del total vendido de cada empleado hoy.</p>
                        </div>
                        <div className={styles.modalBody}>
                            {(!dailySales?.cashiers || dailySales.cashiers.length === 0) ? (
                                <div className={styles.emptyStateContent}>
                                    <CircleDollarSign size={48} style={{ color: '#ccc', marginBottom: '1rem' }} />
                                    <p>Aún no hay ventas registradas hoy por ningún cajero.</p>
                                </div>
                            ) : (
                                <div className={styles.restockList}>
                                    {dailySales.cashiers.map((cashier, index) => (
                                        <div key={index} className={styles.restockItem}>
                                            <div className={styles.restockItemInfo}>
                                                <strong style={{ fontSize: '1.1rem' }}>{index + 1}. {cashier.name}</strong>
                                            </div>
                                            <div className={styles.restockItemMeta}>
                                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--color-success)' }}>
                                                    {formatCurrency(cashier.amount)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Catálogo de Productos */}
            {isProductsModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsProductsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2>Estado del Catálogo</h2>
                                <button className={styles.closeIconButton} onClick={() => setIsProductsModalOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <p className={styles.modalSubtitle}>Resumen y productos próximos a vencer.</p>
                        </div>
                        <div className={styles.modalBody}>
                            {(() => {
                                const now = new Date();
                                const in30Days = new Date();
                                in30Days.setDate(now.getDate() + 30);

                                const expiringItems = allProducts.flatMap(p =>
                                    (p.batches || []).filter((b: any) => {
                                        if (!b.expirationDate) return false;
                                        const exp = new Date(b.expirationDate);
                                        return exp > now && exp <= in30Days;
                                    }).map((b: any) => ({ ...p, batchData: b }))
                                );

                                return (
                                    <>
                                        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                                            <p><strong>Total de Productos Exclusivos:</strong> {totalProducts}</p>
                                            <p><strong>Lotes próximos a vencer (30 días):</strong> {expiringItems.length}</p>
                                        </div>
                                        <h3 style={{ fontSize: '1rem', marginTop: '1rem', marginBottom: '0.5rem' }}>Próximos Vencimientos</h3>
                                        {expiringItems.length === 0 ? (
                                            <div className={styles.emptyStateContent} style={{ padding: '1rem' }}>
                                                <p>No hay lotes próximos a vencer a la vista.</p>
                                            </div>
                                        ) : (
                                            <div className={styles.restockList}>
                                                {expiringItems.map((item, index) => (
                                                    <div key={index} className={styles.restockItem}>
                                                        <div className={styles.restockItemInfo}>
                                                            <strong>{item.name}</strong>
                                                            <span>Vence: {new Date(item.batchData.expirationDate).toLocaleDateString()}</span>
                                                        </div>
                                                        <div className={styles.restockItemMeta}>
                                                            <button className={styles.warningBadge} style={{ cursor: 'pointer', border: 'none' }}>
                                                                Generar Oferta
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Plantilla de Empleados */}
            {isEmployeesModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsEmployeesModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h2>Resumen de Asistencia</h2>
                                <button className={styles.closeIconButton} onClick={() => setIsEmployeesModalOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <p className={styles.modalSubtitle}>Control de horarios vs presencialidad.</p>
                        </div>
                        <div className={styles.modalBody}>
                            {(() => {
                                const now = new Date();
                                const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                                return (
                                    <div className={styles.restockList}>
                                        {allEmployees.map((emp) => {
                                            const start = emp.shiftStart;
                                            const end = emp.shiftEnd;
                                            let isExpected = false;
                                            if (start && end) {
                                                if (start <= end) isExpected = currentTime >= start && currentTime <= end;
                                                else isExpected = currentTime >= start || currentTime <= end;
                                            }

                                            // Logica de "respetan"
                                            // 1) deberia estar y ESTA -> respeta (OK)
                                            // 2) deberia estar y NO ESTA -> NO respeta (FALTA)
                                            // 3) NO deberia estar y ESTA -> EXTRA
                                            // 4) NO deberia estar y NO ESTA -> OK (Fuera de turno)

                                            let statusText = "Fuera de turno";
                                            let statusColor = "var(--color-text-muted)";

                                            if (isExpected && emp.isClockedIn) {
                                                statusText = "Cumpliendo horario";
                                                statusColor = "var(--color-success)";
                                            } else if (isExpected && !emp.isClockedIn) {
                                                statusText = "Falta / Ausente";
                                                statusColor = "var(--color-danger)";
                                            } else if (!isExpected && emp.isClockedIn) {
                                                statusText = "Horas Extra / Fuera de Turno";
                                                statusColor = "var(--color-primary)";
                                            }

                                            return (
                                                <div key={emp.id} className={styles.restockItem} style={{ borderLeft: `4px solid ${statusColor}` }}>
                                                    <div className={styles.restockItemInfo}>
                                                        <strong>{emp.firstName} {emp.lastName}</strong>
                                                        <span>Horario: {start && end ? `${start} - ${end}` : 'Sin definir'}</span>
                                                    </div>
                                                    <div className={styles.restockItemMeta} style={{ textAlign: 'right' }}>
                                                        <span style={{ fontWeight: 'bold', color: statusColor, display: 'block', fontSize: '0.9rem' }}>{statusText}</span>
                                                        <span style={{ fontSize: '0.8rem', color: emp.isClockedIn ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                                                            {emp.isClockedIn ? 'Marcó Entrada' : 'Sin Marcar'}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {allEmployees.length === 0 && (
                                            <div className={styles.emptyStateContent}>
                                                <p>No hay empleados registrados en el sistema.</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
