import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginPage.module.css';
import { apiClient } from '../../../infrastructure/api/apiClient';
import { jwtDecode } from 'jwt-decode';

export const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await apiClient.post('/auth/login', { email, password });

            // Decodificamos el JWT para extraer el rol encriptado y guardar los flags
            const decodedToken: any = jwtDecode(response.token);

            sessionStorage.setItem('easyst_token', response.token);
            sessionStorage.setItem('user_role', decodedToken.role);

            // Redirección inteligente basada en el rol real del usuario
            if (decodedToken.role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else {
                navigate('/cashier/pos');
            }
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <img src="/mesa de trabajo.png" alt="EasySt V2" className={styles.logo} />
                <p className={styles.subtitle}>Inicia sesion en tu cuenta</p>
                {error && <p className={styles.errorText} style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
                <form className={styles.form} onSubmit={handleLogin}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="email">Correo electronico</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="admin@kioscocacho.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="password">Contrasena</label>
                        <input
                            type="password"
                            id="password"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className={styles.button} disabled={isLoading}>
                        {isLoading ? 'Ingresando...' : 'Ingresar al sistema'}
                    </button>
                </form>
            </div>
        </div>
    );
};