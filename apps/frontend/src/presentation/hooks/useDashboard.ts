import { useState, useEffect } from 'react';
import { apiClient } from '../../infrastructure/api/apiClient';

interface PaymentBreakdown {
    method: string;
    amount: number;
}

interface EmployeeData {
    id: string;
    firstName: string;
    lastName: string;
    shiftStart: string | null;
    shiftEnd: string | null;
    isClockedIn: boolean;
    role?: { name: string } | null;
}

interface DailySalesData {
    totalAmount: number;
    breakdown: PaymentBreakdown[];
    employees: EmployeeData[];
}

/**
 * Hook personalizado para obtener y mantener actualizados los datos del Dashboard.
 * Implementa un mecanismo de recarga silenciosa (Polling) cada 10 segundos.
 */
export const useDashboard = () => {
    const [salesData, setSalesData] = useState<DailySalesData>({ totalAmount: 0, breakdown: [], employees: [] });
    const [isLoading, setIsLoading] = useState(true);

    const fetchDashboardData = async () => {
        try {
            // Llamamos al endpoint que construimos previamente en el backend
            const [salesResponse, employeesResponse] = await Promise.all([
                apiClient.get('/reports/daily-sales').catch(() => ({ totalAmount: 0, breakdown: [] })),
                apiClient.get('/employees').catch(() => [])
            ]);

            setSalesData({
                ...salesResponse,
                employees: employeesResponse
            });
        } catch (error) {
            console.error('Error al obtener datos del dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Primera carga inmediata
        fetchDashboardData();

        // Configuracion del Polling (10000 ms = 10 segundos)
        const intervalId = setInterval(fetchDashboardData, 10000);

        // Limpieza del intervalo cuando el componente se desmonta
        return () => clearInterval(intervalId);
    }, []);

    return { salesData, isLoading };
};