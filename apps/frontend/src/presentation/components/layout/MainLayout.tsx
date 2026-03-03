import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import styles from './MainLayout.module.css';

export const MainLayout: React.FC = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('user_role'); // 'ADMIN' o 'CASHIER'

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <h2>EasySt V2</h2>
                    <span className={styles.roleBadge}>{userRole}</span>
                </div>
                <nav className={styles.nav}>
                    <ul>
                        {/* MENU PARA ADMIN */}
                        {/* MENU PARA ADMIN */}
                        {userRole === 'ADMIN' && (
                            <>
                                <li>
                                    <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                                        Dashboard (Resumen)
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/admin/stock" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                                        Stock
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/admin/employees" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                                        Empleados
                                    </NavLink>
                                </li>
                                <li>
                                    <NavLink to="/admin/reports" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                                        Reportes
                                    </NavLink>
                                </li>
                            </>
                        )}

                        {/* MENU PARA CAJERO */}
                        {userRole === 'CASHIER' && (
                            <li>
                                <NavLink to="/cashier/pos" className={({ isActive }) => isActive ? styles.activeLink : styles.link}>
                                    Punto de Venta (POS)
                                </NavLink>
                            </li>
                        )}

                        {/* COMUN */}
                        <li className={styles.logoutItem}>
                            <button onClick={handleLogout} className={styles.logoutButton}>Cerrar Sesión</button>
                        </li>
                    </ul>
                </nav>
            </aside>
            <main className={styles.mainContent}>
                <Outlet />
            </main>
        </div>
    );
};