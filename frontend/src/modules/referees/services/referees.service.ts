import { apiClient } from '../../../api/apiClient';
import type { Referee } from '../../../types';

export const getReferees = async (): Promise<Referee[]> => {
    const response = await apiClient.get<Referee[]>('/referees');
    return response.data;
};

export const createReferee = async (data: { name: string; phone?: string; email?: string }): Promise<Referee> => {
    const response = await apiClient.post<Referee>('/referees', data);
    return response.data;
};

export const updateReferee = async (id: number, data: Partial<Referee>): Promise<Referee> => {
    const response = await apiClient.put<Referee>(`/referees/${id}`, data);
    return response.data;
};

export const deleteReferee = async (id: number): Promise<void> => {
    await apiClient.delete(`/referees/${id}`);
};