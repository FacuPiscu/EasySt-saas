import React, { useState } from 'react';
import { useDashboard } from '../../../hooks/useDashboard';
import styles from './DashboardPage.module.css';

export const DashboardPage: React.FC = () => {
    const { salesData, isLoading } = useDashboard();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Formateador de moneda argentina
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Resumen del Dia</h1>
                <p className={styles.date}>{new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </header>

            <main className={styles.grid}>
                {/* Tarjeta de Facturacion */}
                <section className={styles.card} onClick={() => setIsModalOpen(true)}>
                    <h2 className={styles.cardTitle}>Facturacion Total</h2>
                    <p className={styles.mainAmount}>
                        {isLoading ? 'Cargando...' : formatCurrency(salesData.totalAmount)}
                    </p>
                    <span className={styles.cardHint}>Click para ver desglose por metodo de pago</span>
                </section>

                {/* Tarjeta de Cajeros Activos (Placeholder para la proxima etapa) */}
                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>Cajeros Activos</h2>
                    <ul className={styles.cashierList}>
                        <li className={styles.emptyState}>No hay cajeros en turno actualmente.</li>
                    </ul>
                </section>

                {/* Tarjeta de Registro de Eventos (Seccion ancha) */}
                <section className={`${styles.card} ${styles.fullWidth}`}>
                    <h2 className={styles.cardTitle}>Registro de Eventos y Ventas</h2>
                    <div className={styles.eventLog}>
                        <p className={styles.emptyState}>Esperando actividad en las cajas...</p>
                    </div>
                </section>
            </main>

            {/* Modal de Desglose */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <h2>Desglose de Facturacion</h2>
                        <div style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
                            {salesData.breakdown.length === 0 ? (
                                <p className={styles.emptyState}>Aun no hay ventas registradas hoy.</p>
                            ) : (
                                salesData.breakdown.map((item, index) => (
                                    <p key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                                        <span>{item.method === 'CASH' ? 'Efectivo' : item.method === 'TRANSFER' ? 'Transferencia' : item.method}</span>
                                        <span style={{ fontWeight: 'bold' }}>{formatCurrency(item.amount)}</span>
                                    </p>
                                ))
                            )}
                        </div>
                        <button className={styles.closeButton} onClick={() => setIsModalOpen(false)}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
};