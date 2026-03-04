import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importacion de vistas
import { LoginPage } from './pages/auth/LoginPage';
import { EmployeeManagementPage } from './pages/admin/employees/EmployeeManagementPage';
import { StockPage } from './pages/admin/stock/StockPage';
import { DashboardPage } from './pages/admin/dashboard/DashboardPage'; // <-- Nueva!
import { PointOfSalePage } from './pages/cashier/PointOfSalePage';
import { MainLayout } from './components/layout/MainLayout';

export const AppRouter: React.FC = () => {
    // Leemos el rol del sessionStorage
    const isAuthenticated = !!sessionStorage.getItem('easyst_token');
    const userRole = sessionStorage.getItem('user_role'); // 'ADMIN' o 'CASHIER'

    return (
        <BrowserRouter>
            <Routes>
                {/* 1. Ruta Raíz: Redirección inteligente */}
                <Route path="/" element={
                    isAuthenticated
                        ? (userRole === 'ADMIN' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/cashier/pos" />)
                        : <Navigate to="/login" />
                } />

                {/* 2. Rutas Publicas */}
                <Route path="/login" element={<LoginPage />} />

                {/* 3. Rutas de Administrador */}
                <Route path="/admin" element={<MainLayout />}>
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="employees" element={<EmployeeManagementPage />} />
                    <Route path="stock" element={<StockPage />} />
                    {/* Redirección interna si entran solo a /admin */}
                    <Route index element={<Navigate to="dashboard" />} />
                </Route>

                {/* 4. Rutas de Cajero */}
                <Route path="/cashier" element={<MainLayout />}>
                    <Route path="pos" element={<PointOfSalePage />} />
                    <Route index element={<Navigate to="pos" />} />
                </Route>

                {/* 5. Redireccion por defecto */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
};