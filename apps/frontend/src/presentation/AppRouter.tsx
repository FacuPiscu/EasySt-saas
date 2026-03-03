import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { EmployeeManagementPage } from './pages/admin/employees/EmployeeManagementPage';
import { PointOfSalePage } from './pages/cashier/PointOfSalePage';

export const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas Públicas */}
                <Route path="/" element={<LoginPage />} />

                {/* Rutas Privadas (Protegidas por Layout) */}
                <Route element={<MainLayout />}>
                    <Route path="/cashier" element={<PointOfSalePage />} />
                    <Route path="/admin/employees" element={<EmployeeManagementPage />} />
                </Route>

                {/* Ruta de Comodín (Fallback) */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};
