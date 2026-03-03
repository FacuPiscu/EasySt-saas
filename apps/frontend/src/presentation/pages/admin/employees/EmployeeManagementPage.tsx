import React from 'react';
import styles from './EmployeeManagementPage.module.css';

export const EmployeeManagementPage: React.FC = () => {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Employee Management</h1>
                <button className={styles.addButton}>+ Add Employee</button>
            </header>

            <section className={styles.content}>
                <div className={styles.tableCard}>
                    <p className={styles.placeholderText}>
                        // Placeholder: Aquí se renderizará la tabla o grid con el listado de cajeros del Tenant
                    </p>
                </div>
            </section>
        </div>
    );
};
