import { apiClient } from '../../infrastructure/api/apiClient';

/**
 * Caso de Uso: Obtener el resumen del dia para el administrador.
 * Esta capa se encarga de pedir los datos y podria transformarlos si fuera necesario.
 */
export const GetDashboardSummary = async () => {
    // Aqui podrias agregar logica extra, como filtrar datos o validar permisos
    return await apiClient.get('/reports/daily-sales');
};