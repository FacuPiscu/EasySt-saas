import { toast } from 'sonner';

/**
 * Cliente HTTP base para comunicarse con el backend.
 * Se encarga de adjuntar el token de autorizacion en cada peticion.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getHeaders = (): Record<string, string> => {
    const token = sessionStorage.getItem('easyst_token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        if (response.status >= 500) {
            toast.error('Error interno del servidor. Nuestros servicios experimentan intermitencia.');
        }

        const errorData = await response.json().catch(() => ({}));

        if (response.status === 401 && errorData.error === 'No autorizado. Token expedido o alterado.') {
            toast.error('Tu sesión ha expirado por inactividad. Inicia sesión nuevamente.');
            // Defer redirect
            setTimeout(() => {
                sessionStorage.clear();
                window.location.href = '/login';
            }, 2000);
        }

        throw new Error(errorData.error || 'Error en la petición de red');
    }
    return response.json();
};

export const apiClient = {
    get: async (endpoint: string) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: getHeaders(),
            cache: 'no-store'
        });
        return handleResponse(response);
    },

    post: async (endpoint: string, body: any) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        return handleResponse(response);
    },

    put: async (endpoint: string, body: any) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        return handleResponse(response);
    },

    patch: async (endpoint: string, body: any) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify(body),
        });
        return handleResponse(response);
    },

    delete: async (endpoint: string) => {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponse(response);
    }
};