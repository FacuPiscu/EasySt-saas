import React, { useState } from 'react';
import { useDashboard } from '../../../hooks/useDashboard';
import { apiClient } from '../../../../infrastructure/api/apiClient';
import { toast } from 'sonner';
import styles from './DashboardPage.module.css';

export const DashboardPage: React.FC = () => {
    const { salesData, isLoading, refreshDashboard } = useDashboard();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [realTime, setRealTime] = useState(new Date());

    const [clockingEmployee, setClockingEmployee] = useState<any | null>(null);
    const [clockingTime, setClockingTime] = useState(new Date());

    React.useEffect(() => {
        if (!clockingEmployee) return;
        setClockingTime(new Date());
        const t = setInterval(() => setClockingTime(new Date()), 1000);
        return () => clearInterval(t);
    }, [clockingEmployee]);

    React.useEffect(() => {
        // Se sincroniza cada 1 minuto (60000ms) para evitar lag en la UI pero mantener todo al día
        const timer = setInterval(() => setRealTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Formateador de moneda argentina
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    };

    const getShiftStatus = (emp: any) => {
        if (!emp.shiftStart || !emp.shiftEnd) return false;

        const currentHours = realTime.getHours().toString().padStart(2, '0');
        const currentMinutes = realTime.getMinutes().toString().padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;

        const start = emp.shiftStart;
        const end = emp.shiftEnd;

        if (start <= end) {
            return currentTime >= start && currentTime <= end;
        } else {
            return currentTime >= start || currentTime <= end;
        }
    };

    const handleClockIn = async (employeeId: string, currentStatus: boolean) => {
        try {
            await apiClient.patch(`/employees/${employeeId}/clock`, {});
            toast.success(currentStatus ? 'Salida registrada correctamente' : 'Entrada registrada correctamente');
            // Instant refresh of the dashboard to show exactly UI state change
            await refreshDashboard();
        } catch (error: any) {
            toast.error(error.message || 'Error al procesar asistencia');
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Resumen del Día</h1>
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
                        ) : (
                            salesData.employees.map(emp => {
                                const isExpected = getShiftStatus(emp);
                                return (
                                    <li key={emp.id} style={{
                                        display: 'flex', flexDirection: 'column', padding: '1rem',
                                        borderRadius: '8px',
                                        border: emp.isClockedIn ? '1px solid var(--color-success)' : '1px solid var(--color-border)',
                                        backgroundColor: emp.isClockedIn ? 'rgba(34, 197, 94, 0.05)' : 'transparent'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                                <span style={{ fontWeight: 'bold' }}>{emp.firstName} {emp.lastName}</span>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                                    {emp.role?.name || 'Empleado'} | {emp.shiftStart} - {emp.shiftEnd}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setClockingEmployee(emp); }}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '6px',
                                                    border: '1px solid',
                                                    borderColor: emp.isClockedIn ? 'transparent' : 'var(--color-border)',
                                                    backgroundColor: emp.isClockedIn ? 'var(--color-background)' : 'transparent',
                                                    color: emp.isClockedIn ? 'var(--color-text-main)' : 'var(--color-text-main)',
                                                    cursor: 'pointer',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                {emp.isClockedIn ? 'Marcar Salida' : 'Marcar Entrada'}
                                            </button>
                                        </div>
                                        {!emp.isClockedIn && isExpected && (
                                            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-danger)', fontWeight: '600' }}>
                                                Alerta: El empleado debería estar en turno y no marcó su entrada.
                                            </p>
                                        )}
                                    </li>
                                )
                            })
                        )}
                    </ul>
                </section>

                {/* Tarjeta de Turnos del Día */}
                <section className={styles.card}>
                    <h2 className={styles.cardTitle}>Turnos del Día</h2>
                    <ul className={styles.cashierList} style={{ gap: '0.75rem', justifyContent: 'flex-start' }}>
                        {!salesData.employees || salesData.employees.length === 0 ? (
                            <li className={styles.emptyState}>No hay empleados registrados.</li>
                        ) : (
                            salesData.employees
                                .filter(emp => emp.shiftStart && emp.shiftEnd)
                                .sort((a, b) => (a.shiftStart || '').localeCompare(b.shiftStart || ''))
                                .map(emp => {
                                    const isExpected = getShiftStatus(emp);
                                    return (
                                        <li key={`shift-${emp.id}`} style={{
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem',
                                            borderRadius: '6px',
                                            backgroundColor: isExpected ? 'rgba(59, 130, 246, 0.05)' : 'var(--color-surface)',
                                            border: isExpected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                                        }}>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: '600', color: isExpected ? 'var(--color-primary)' : 'var(--color-text-main)' }}>
                                                    {emp.firstName} {emp.lastName}
                                                </span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                    {emp.role?.name || 'Empleado'}
                                                </span>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <span style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--color-text-main)' }}>
                                                    {emp.shiftStart} - {emp.shiftEnd}
                                                </span>
                                                {isExpected && <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 'bold' }}>EN HORARIO</span>}
                                            </div>
                                        </li>
                                    );
                                })
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

            {/* Modal de Asistencia (Confirmar Entrada/Salida) */}
            {clockingEmployee && (
                <div className={styles.modalOverlay} onClick={() => setClockingEmployee(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                        <h2>Confirmar {clockingEmployee.isClockedIn ? 'Salida' : 'Entrada'}</h2>
                        <div style={{ marginTop: '1.5rem', marginBottom: '2rem' }}>
                            <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>
                                Empleado: <strong>{clockingEmployee.firstName} {clockingEmployee.lastName}</strong>
                            </p>
                            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary)', margin: '0.5rem 0' }}>
                                {clockingTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </p>
                            <p style={{ fontSize: '1rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
                                {clockingTime.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                className={styles.closeButton}
                                style={{ marginTop: 0, backgroundColor: 'transparent', color: 'var(--color-text-main)', border: '1px solid var(--color-border)', flex: 1 }}
                                onClick={() => setClockingEmployee(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className={styles.closeButton}
                                style={{ marginTop: 0, backgroundColor: clockingEmployee.isClockedIn ? 'var(--color-danger)' : 'var(--color-success)', color: 'white', border: 'none', flex: 1 }}
                                onClick={() => {
                                    handleClockIn(clockingEmployee.id, clockingEmployee.isClockedIn);
                                    setClockingEmployee(null);
                                }}
                            >
                                Confirmar {clockingEmployee.isClockedIn ? 'Salida' : 'Entrada'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};