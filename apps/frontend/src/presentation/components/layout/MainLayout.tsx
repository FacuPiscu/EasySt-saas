import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import styles from './MainLayout.module.css';

export const MainLayout: React.FC = () => {
    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <h2>EasySt SaaS</h2>
                </div>
                <nav className={styles.nav}>
                    <ul>
                        <li><Link to="/cashier">Point of Sale</Link></li>
                        <li><Link to="/admin/employees">Employees</Link></li>
                        <li><Link to="/">Sign Out</Link></li>
                    </ul>
                </nav>
            </aside>
            <main className={styles.mainContent}>
                <Outlet />
            </main>
        </div>
    );
};
