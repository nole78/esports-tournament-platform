import axios from "axios";
import type { IGameAPIService } from "./IGameAPIService";
import type { GameDto } from "../../models/game/GameDto";
import { readItem } from "../../helpers/local_storage";
import type { ApiResponse } from "../tournament_list/ITournamentAPIService";

const BASE = import.meta.env.VITE_API_URL + "games";

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const err = <T>(e: Error, fallback: string): ApiResponse<T> => ({
  success: false,
  message: axios.isAxiosError(e) ? (e.response?.data as { message?: string })?.message ?? fallback : fallback,
});

export const gameApi: IGameAPIService = {
  async getAll(page = 1, limit = 20) {
    return axios.get(`${BASE}?page=${page}&limit=${limit}`, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to load items"));
  },
  async getById(id) {
    return axios.get<ApiResponse<GameDto>>(`${BASE}/${id}`, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to load item"));
  },
  async create(payload) {
    return axios.post<ApiResponse<GameDto>>(BASE, payload, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to create"));
  },
  async update(id, payload) {
    return axios.patch<ApiResponse<void>>(`${BASE}/${id}`, payload, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to update"));
  },
  async delete(id) {
    return axios.delete<ApiResponse<void>>(`${BASE}/${id}`, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to delete"));
  },
};
