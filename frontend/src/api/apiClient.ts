import axios from 'axios';

function resolveBaseUrl(): string {
    const envUrl = import.meta.env?.VITE_API_URL as string | undefined;
    if (envUrl && envUrl.trim()) {
        return envUrl.trim();
    }

    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const portFromQuery = params.get('apiPort');
        if (portFromQuery) {
            return `http://127.0.0.1:${portFromQuery}/api`;
        }
    }

    return 'http://localhost:3000/api';
}

export const apiClient = axios.create({
    baseURL: resolveBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});