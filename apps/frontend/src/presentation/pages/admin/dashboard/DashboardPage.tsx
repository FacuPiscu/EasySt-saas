import React, { useState, useMemo } from 'react';
import { useDashboard } from '../../../hooks/useDashboard';
import { apiClient } from '../../../../infrastructure/api/apiClient';
import { toast } from 'sonner';
import styles from './DashboardPage.module.css';

export const DashboardPage: React.FC = () => {
    const { salesData, isLoading } = useDashboard();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Formateador de moneda argentina
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    };

    // Calculador de Turnos Actuales
    const expectedEmployees = useMemo(() => {
        if (!salesData.employees) return [];

        const now = new Date();
        const currentHours = now.getHours().toString().padStart(2, '0');
        const currentMinutes = now.getMinutes().toString().padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;

        return salesData.employees.filter((emp) => {
            if (!emp.shiftStart || !emp.shiftEnd) return false;

            const start = emp.shiftStart;
            const end = emp.shiftEnd;

            if (start <= end) {
                // Turno normal (ej: 08:00 a 16:00)
                return currentTime >= start && currentTime <= end;
            } else {
                // Turno nocturno (ej: 22:00 a 06:00)
                return currentTime >= start || currentTime <= end;
            }
        });
    }, [salesData.employees]);

    const handleClockIn = async (employeeId: string, currentStatus: boolean) => {
        try {
            await apiClient.patch(`/employees/${employeeId}/clock`, {});
            toast.success(currentStatus ? 'Salida registrada correctamente' : 'Entrada registrada correctamente');
            // The polling dashboard will catch the update automatically in next 10s, 
            // but we could refresh instantly. Let's rely on polling or a quick refresh.
        } catch (error: any) {
            toast.error(error.message || 'Error al procesar asistencia');
        }
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

                {/* Tarjeta de Asistencia de Personal */}
                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>En Turno / Asistencia</h2>
                    <ul className={styles.cashierList} style={{ gap: '1rem', justifyContent: 'flex-start' }}>
                        {!salesData.employees || salesData.employees.length === 0 ? (
                            <li className={styles.emptyState}>Cargando plantilla...</li>
                        ) : expectedEmployees.length === 0 ? (
                            <li className={styles.emptyState}>Ningún empleado programado para esta hora.</li>
                        ) : (
                            expectedEmployees.map(emp => (
                                <li key={emp.id} style={{
                                    display: 'flex', flexDirection: 'column', padding: '1rem',
                                    borderRadius: '8px',
                                    border: emp.isClockedIn ? '1px solid var(--color-success)' : '1px solid var(--color-danger)',
                                    backgroundColor: emp.isClockedIn ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <span style={{ fontWeight: 'bold' }}>{emp.firstName} {emp.lastName}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                {emp.role?.name || 'Empleado'} | {emp.shiftStart} - {emp.shiftEnd}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleClockIn(emp.id, emp.isClockedIn); }}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '6px',
                                                border: 'none',
                                                backgroundColor: emp.isClockedIn ? 'var(--color-background)' : 'var(--color-danger)',
                                                color: emp.isClockedIn ? 'var(--color-text-main)' : 'white',
                                                cursor: 'pointer',
                                                fontWeight: '500'
                                            }}
                                        >
                                            {emp.isClockedIn ? 'Marcar Salida' : 'Marcar Entrada'}
                                        </button>
                                    </div>
                                    {!emp.isClockedIn && (
                                        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-danger)', fontWeight: '600', animation: 'fadeIn 1s infinite alternate' }}>
                                            ⚠️ Alerta: El empleado debería estar en turno.
                                        </p>
                                    )}
                                </li>
                            ))
                        )}
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