/**
 * Cliente HTTP base para comunicarse con el backend.
 * Se encarga de adjuntar el token de autorizacion en cada peticion.
 */

const BASE_URL = 'http://localhost:3001/api';

export const apiClient = {
    get: async (endpoint: string) => {
        // Obtenemos el token temporalmente de localStorage (luego lo manejaremos con Context)
        const token = localStorage.getItem('easyst_token');

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Error en la peticion de red');
        }

        return response.json();
    },
    post: async (endpoint: string, body: any) => {
        const token = localStorage.getItem('easyst_token');

        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Error en la peticion de red');
        }

        return response.json();
    }
};