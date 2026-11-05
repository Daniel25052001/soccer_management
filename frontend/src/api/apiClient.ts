import axios from 'axios';

export const apiClient = axios.create({
    baseURL: 'http://localhost:3000/api', // Agrega /api si lo activaste en NestJS
    headers: {
        'Content-Type': 'application/json',
    },
});