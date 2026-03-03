import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importacion de vistas
import { LoginPage } from './pages/auth/LoginPage';
import { EmployeeManagementPage } from './pages/admin/employees/EmployeeManagementPage';
import { PointOfSalePage } from './pages/cashier/PointOfSalePage';
import { MainLayout } from './components/layout/MainLayout';

/**
 * Enrutador principal de la aplicacion.
 * Gestiona la navegacion publica y las rutas protegidas por rol.
 * NOTA: Los Guards de seguridad se implementaran en una fase posterior.
 */
export const AppRouter: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas Publicas */}
                <Route path="/login" element={<LoginPage />} />

                {/* Rutas de Administrador (Dentro del Layout Principal) */}
                <Route path="/admin" element={<MainLayout />}>
                    <Route path="employees" element={<EmployeeManagementPage />} />
                </Route>

                {/* Rutas de Cajero (Dentro del Layout Principal) */}
                <Route path="/cashier" element={<MainLayout />}>
                    <Route path="pos" element={<PointOfSalePage />} />
                </Route>

                {/* Redireccion por defecto */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
};