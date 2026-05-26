import axios from "axios";
import type { IUserWatchListAPIService, ApiResponse } from "./IUserWatchlistAPIService";
import { readItem } from "../../helpers/local_storage";

const BASE = import.meta.env.VITE_API_URL + "watchlist";

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const err = <T>(e: Error, fallback: string): ApiResponse<T> => ({
  success: false,
  message: axios.isAxiosError(e) ? (e.response?.data as { message?: string })?.message ?? fallback : fallback,
});

export const userWatchlistApi: IUserWatchListAPIService = {
    async getById(id, page = 1, limit = 20){
    return axios.post(`${BASE}?page=${page}&limit=${limit}`, { id }, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to load items"));
    },
    async delete(id, tournamentId){
        return axios.delete<ApiResponse<void>>(`${BASE}/${tournamentId}`, { headers: authHeader(), data: { id } })
      .then(r => r.data).catch(e => err(e, "Failed to delete"));
    }
};