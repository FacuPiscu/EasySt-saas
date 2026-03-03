import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Redireccion temporal a modo de placeholder para continuar el flujo
        navigate('/cashier/pos');
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <img src="/mesa de trabajo.png" alt="EasySt SaaS" className={styles.logo} />
                <p className={styles.subtitle}>Inicia sesion en tu cuenta</p>
                <form className={styles.form} onSubmit={handleLogin}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Correo electronico</label>
                        <input type="email" id="email" placeholder="admin@kioscocacho.com" required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Contrasena</label>
                        <input type="password" id="password" placeholder="********" required />
                    </div>
                    <button type="submit" className={styles.button}>Ingresar al sistema</button>
                </form>
            </div>
        </div>
    );
};