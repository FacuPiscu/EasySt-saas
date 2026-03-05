import React, { useState } from 'react';
import { useEmployees, type Employee } from '../../../hooks/useEmployees';
import styles from './EmployeeManagementPage.module.css';

export const EmployeeManagementPage: React.FC = () => {
    const { employees, roles, isLoading, createEmployee, updateEmployee, toggleStatus, deleteEmployee, createRole } = useEmployees();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isSystemAccess, setIsSystemAccess] = useState(false);

    // Formulario de Roles
    const [roleFormData, setRoleFormData] = useState({
        name: '',
        functions: '',
        systemRole: 'NONE'
    });
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        document: '',
        phone: '',
        shiftStart: '08:00',
        shiftEnd: '16:00',
        employeeRoleId: '',
        email: '',
        password: ''
    });

    const resetForm = () => {
        setFormData({
            firstName: '', lastName: '', document: '', phone: '',
            shiftStart: '08:00', shiftEnd: '16:00', employeeRoleId: '',
            email: '', password: ''
        });
        setIsSystemAccess(false);
    };

    const handleOpenModal = (employee?: Employee) => {
        if (employee) {
            setSelectedEmployee(employee);
            setFormData({
                firstName: employee.firstName,
                lastName: employee.lastName,
                document: employee.document || '',
                phone: employee.phone || '',
                shiftStart: employee.shiftStart || '08:00',
                shiftEnd: employee.shiftEnd || '16:00',
                employeeRoleId: employee.role?.id || '',
                email: employee.user?.email || '',
                password: '' // Contraseña siempre vacía por seguridad
            });
            setIsSystemAccess(!!employee.user);
        } else {
            setSelectedEmployee(null);
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validacion manual basic
        const payload = {
            ...formData,
            hasSystemAccess: isSystemAccess
        };

        let success = false;
        if (selectedEmployee) {
            // Edición
            if (!payload.password) delete (payload as any).password;
            success = await updateEmployee(selectedEmployee.id, payload);
        } else {
            // Creación
            success = await createEmployee(payload);
        }

        if (success) {
            handleCloseModal();
        }
    };

    const handleToggleStatus = (e: React.MouseEvent, employee: Employee) => {
        e.stopPropagation();
        const confirmMsg = employee.isActive
            ? `¿Deseas deshabilitar a ${employee.firstName}?`
            : `¿Deseas reactivar a ${employee.firstName}?`;

        if (window.confirm(confirmMsg)) {
            toggleStatus(employee.id, employee.isActive, {
                ...employee,
                hasSystemAccess: !!employee.user
            });
        }
    };

    const handleDelete = (e: React.MouseEvent, employee: Employee) => {
        e.stopPropagation();
        if (window.confirm(`¿Seguro que deseas eliminar definitivamente a ${employee.firstName}? Esta acción no se puede deshacer.`)) {
            deleteEmployee(employee.id);
        }
    };

    const handleRoleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await createRole(roleFormData);
        if (success) {
            setIsRoleModalOpen(false);
            setRoleFormData({ name: '', functions: '', systemRole: 'NONE' });
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerTitle}>
                    <h1>Plantilla de Empleados</h1>
                    <p>Gestiona el personal, roles y accesos al sistema.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button className={styles.secondaryButton} onClick={() => setIsRoleModalOpen(true)} style={{ margin: 0 }}>
                        Gestionar Roles
                    </button>
                    <button className={styles.primaryButton} onClick={() => handleOpenModal()} style={{ margin: 0 }}>
                        + Agregar Empleado
                    </button>
                </div>
            </header>

            <div className={styles.tableContainer}>
                {isLoading ? (
                    <div className={styles.loadingState}>Cargando plantilla...</div>
                ) : employees.length === 0 ? (
                    <div className={styles.emptyState}>No hay empleados registrados en tu sucursal.</div>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Documento</th>
                                <th>Rol / Puesto</th>
                                <th>Horario Asignado</th>
                                <th>Acceso App</th>
                                <th>Asistencia Hoy</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp.id} className={styles.clickableRow} onClick={() => handleOpenModal(emp)}>
                                    <td className={styles.primaryCell}>{emp.firstName} {emp.lastName}</td>
                                    <td>{emp.document || '---'}</td>
                                    <td>{emp.role?.name || 'Sin Asignar'}</td>
                                    <td>{emp.shiftStart && emp.shiftEnd ? `${emp.shiftStart} - ${emp.shiftEnd}` : 'Variable'}</td>
                                    <td>
                                        <span className={`${styles.badge} ${emp.user ? styles.badgeSuccess : styles.badgeDanger}`}>
                                            {emp.user ? 'Si' : 'No'}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.badge} ${emp.isClockedIn ? styles.badgeSuccess : styles.badgeDanger}`} style={{ backgroundColor: emp.isClockedIn ? 'var(--color-success)' : 'transparent', color: emp.isClockedIn ? '#fff' : 'inherit' }}>
                                            {emp.isClockedIn ? 'En Turno' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={(e) => handleToggleStatus(e, emp)}
                                            style={{ cursor: 'pointer', border: 'none', backgroundColor: '#f59e0b', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '4px', marginRight: '8px', fontSize: '0.85rem' }}>
                                            {emp.isActive ? 'Desactivar' : 'Reactivar'}
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, emp)}
                                            style={{ cursor: 'pointer', border: 'none', backgroundColor: '#ef4444', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem' }}>
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={handleCloseModal}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>{selectedEmployee ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}</h2>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className={styles.grid2}>
                                <div className={styles.formGroup}>
                                    <label>Nombre *</label>
                                    <input required className={styles.formControl} name="firstName" value={formData.firstName} onChange={handleChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Apellido *</label>
                                    <input required className={styles.formControl} name="lastName" value={formData.lastName} onChange={handleChange} />
                                </div>
                            </div>

                            <div className={styles.grid2}>
                                <div className={styles.formGroup}>
                                    <label>DNI / Documento *</label>
                                    <input required className={styles.formControl} name="document" value={formData.document} onChange={handleChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Teléfono (Opcional)</label>
                                    <input className={styles.formControl} name="phone" value={formData.phone} onChange={handleChange} />
                                </div>
                            </div>

                            <div className={styles.grid2}>
                                <div className={styles.formGroup}>
                                    <label>Rol de Puesto</label>
                                    <select className={styles.formControl} name="employeeRoleId" value={formData.employeeRoleId} onChange={handleChange}>
                                        <option value="">Seleccione un rol...</option>
                                        {roles.map(r => (
                                            <option key={r.id} value={r.id}>{r.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className={styles.grid2}>
                                <div className={styles.formGroup}>
                                    <label>Horario Ingreso (HH:MM)</label>
                                    <input required type="time" className={styles.formControl} name="shiftStart" value={formData.shiftStart} onChange={handleChange} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Horario Salida (HH:MM)</label>
                                    <input required type="time" className={styles.formControl} name="shiftEnd" value={formData.shiftEnd} onChange={handleChange} />
                                </div>
                            </div>

                            <div className={styles.formGroup} style={{ marginTop: '1.5rem', marginBottom: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                                <label className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={isSystemAccess}
                                        onChange={(e) => setIsSystemAccess(e.target.checked)}
                                    />
                                    Habilitar acceso al sistema (Usuario y Clave)
                                </label>
                            </div>

                            {isSystemAccess && (
                                <div className={styles.grid2} style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', alignItems: 'end' }}>
                                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                        <label>Correo Electrónico *</label>
                                        <input required={isSystemAccess} type="email" className={styles.formControl} name="email" value={formData.email} onChange={handleChange} />
                                    </div>
                                    <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                                        <label>{selectedEmployee ? 'Nueva Contraseña (dejar vacío si no cambia)' : 'Contraseña *'}</label>
                                        <input required={isSystemAccess && !selectedEmployee} type="password" minLength={6} className={styles.formControl} name="password" value={formData.password} onChange={handleChange} />
                                    </div>
                                </div>
                            )}

                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.secondaryButton} onClick={handleCloseModal}>Cancelar</button>
                                <button type="submit" className={styles.primaryButton}>{selectedEmployee ? 'Guardar Cambios' : 'Registrar Empleado'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isRoleModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsRoleModalOpen(false)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                        <div className={styles.modalHeader}>
                            <h2>Crear Nuevo Rol de Empleado</h2>
                        </div>
                        <form onSubmit={handleRoleSubmit}>
                            <div className={styles.formGroup}>
                                <label>Nombre del Rol * (ej. Encargado, Repositor)</label>
                                <input required className={styles.formControl} value={roleFormData.name} onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Descripción (Opcional)</label>
                                <input className={styles.formControl} value={roleFormData.functions} onChange={(e) => setRoleFormData({ ...roleFormData, functions: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Nivel de Permisos en el Sistema</label>
                                <select className={styles.formControl} value={roleFormData.systemRole} onChange={(e) => setRoleFormData({ ...roleFormData, systemRole: e.target.value })}>
                                    <option value="NONE">Sin nivel de permisos (No accede a la app)</option>
                                    <option value="CASHIER">Cajero (Operaciones Básicas y POS)</option>
                                    <option value="ADMIN">Administrador (Acceso Completo)</option>
                                </select>
                            </div>

                            <div className={styles.modalFooter}>
                                <button type="button" className={styles.secondaryButton} onClick={() => setIsRoleModalOpen(false)}>Cancelar</button>
                                <button type="submit" className={styles.primaryButton}>Crear Rol</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
