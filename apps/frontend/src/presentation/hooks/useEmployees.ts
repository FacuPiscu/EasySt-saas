import { useState, useEffect } from 'react';
import { apiClient } from '../../infrastructure/api/apiClient';
import { toast } from 'sonner';

export interface EmployeeRole {
    id: string;
    name: string;
    description: string | null;
    systemRole: string | null;
}

export interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    document: string | null;
    phone: string | null;
    shiftStart: string | null;
    shiftEnd: string | null;
    isActive: boolean;
    isClockedIn: boolean;
    lastClockIn: string | null;
    role: EmployeeRole | null;
    user: any | null; // Tiene datos de acceso al sistema si están presentes
}

export const useEmployees = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [roles, setRoles] = useState<EmployeeRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [employeesRes, rolesRes] = await Promise.all([
                apiClient.get('/employees').catch(() => []),
                apiClient.get('/roles').catch(() => [])
            ]);
            setEmployees(employeesRes);
            setRoles(rolesRes);
        } catch (error: any) {
            toast.error('Error al cargar empleados: ' + (error.message || 'Error desconocido'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const createEmployee = async (data: any) => {
        try {
            await apiClient.post('/employees', data);
            toast.success('Empleado creado correctamente');
            await fetchData();
            return true;
        } catch (error: any) {
            toast.error('Error al crear: ' + (error.message || 'Verifica los datos'));
            return false;
        }
    };

    const createRole = async (data: { name: string, functions: string, systemRole: string }) => {
        try {
            await apiClient.post('/roles', data);
            toast.success('Rol creado correctamente');
            await fetchData();
            return true;
        } catch (error: any) {
            toast.error('Error al crear rol: ' + (error.message || 'Error desconocido'));
            return false;
        }
    };

    const updateEmployee = async (id: string, data: any) => {
        try {
            await apiClient.put(`/employees/${id}`, data);
            toast.success('Cambios guardados');
            await fetchData();
            return true;
        } catch (error: any) {
            toast.error('Error al actualizar: ' + (error.message || 'Verifica los datos'));
            return false;
        }
    };

    const toggleStatus = async (id: string, currentStatus: boolean, data: any) => {
        try {
            // Re-enviamos el payload pero con isActive invertido
            await apiClient.put(`/employees/${id}`, { ...data, isActive: !currentStatus });
            toast.success(currentStatus ? 'Empleado Inactivado' : 'Empleado Activado');
            await fetchData();
        } catch (error: any) {
            toast.error('Error al cambiar estado: ' + (error.message || 'Error desconocido'));
        }
    };

    const deleteEmployee = async (id: string) => {
        try {
            await apiClient.delete(`/employees/${id}`);
            toast.success('Empleado eliminado');
            await fetchData();
            return true;
        } catch (error: any) {
            toast.error('Error al eliminar: ' + (error.message || 'Error desconocido'));
            return false;
        }
    };

    return {
        employees,
        roles,
        isLoading,
        createEmployee,
        updateEmployee,
        deleteEmployee,
        toggleStatus,
        createRole,
        refresh: fetchData
    };
};
