import axios from "axios";
import type { ITournamentAPIService, ApiResponse } from "./ITournamentAPIService";
import type { TournamentDto } from "../../models/tournament/TournamentDto";
import { readItem } from "../../helpers/local_storage";

const BASE = import.meta.env.VITE_API_URL + "tournaments";

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const err = <T>(e: unknown, fallback: string): ApiResponse<T> => ({
  success: false,
  message: axios.isAxiosError(e) ? (e.response?.data as { message?: string })?.message ?? fallback : fallback,
});

export const tournamentApi : ITournamentAPIService = {
    async getAll(page = 1, limit = 20) {
    return axios.get(`${BASE}?page=${page}&limit=${limit}`, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to load items"));
  },
  async getById(id) {
    return axios.get<ApiResponse<TournamentDto>>(`${BASE}/${id}`, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to load item"));
  },
  async create(payload) {
    return axios.post<ApiResponse<TournamentDto>>(BASE, payload, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to create"));
  },
  async update(id, payload) {
    return axios.patch<ApiResponse<void>>(`${BASE}/${id}`, payload, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to update"));
  },
  async delete(id) {
    return axios.delete<ApiResponse<void>>(`${BASE}/${id}`, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to delete"));
  }
}