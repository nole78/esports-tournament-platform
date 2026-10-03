import axios from "axios";
import type { ITournamentAPIService, ApiResponse } from "./ITournamentAPIService";
import type { TournamentDto } from "../../models/tournament/TournamentDto";
import { readItem } from "../../helpers/local_storage";
import type { UserWatchlistDto } from "../../models/user_watchlist/UserWatchlistDto";
import { apiError } from "../apiResponse";

const BASE = import.meta.env.VITE_API_URL + "tournaments";

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const tournamentApi : ITournamentAPIService = {
  async getAll(page = 1, limit = 20) {
    return axios.get(`${BASE}?page=${page}&limit=${limit}`, { headers: authHeader() })
      .then(r => r.data).catch(e => apiError<{ items: TournamentDto[]; total: number }>(e, "Failed to load items"));
  },
  async getById(id) {
    return axios.get<ApiResponse<TournamentDto>>(`${BASE}/${id}`, { headers: authHeader() })
      .then(r => r.data).catch(e => apiError<TournamentDto>(e, "Failed to load item"));
  },
  async create(payload) {
    return axios.post<ApiResponse<TournamentDto>>(BASE, payload, { headers: authHeader() })
      .then(r => r.data).catch(e => apiError<TournamentDto>(e, "Failed to create"));
  },
  async getFiltered(payload, page = 1, limit = 20)
  {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (payload.tournamentGame) params.set("tournamentGame", payload.tournamentGame);
    if (payload.tournamentFormat) params.set("tournamentFormat", payload.tournamentFormat);
    if (payload.tournamentStatus) params.set("tournamentStatus", payload.tournamentStatus);

    return axios.get<ApiResponse<{ items: TournamentDto[]; total: number }>>(`${BASE}?${params.toString()}`, { headers: authHeader() })
      .then(r => r.data).catch(e => apiError<{ items: TournamentDto[]; total: number }>(e, "Failed to load items"));
  },
  async update(id, payload) {
    return axios.put<ApiResponse<void>>(`${BASE}/${id}`, payload, { headers: authHeader() })
      .then(r => r.data).catch(e => apiError<void>(e, "Failed to update"));
  },
  async delete(id) {
    return axios.delete<ApiResponse<void>>(`${BASE}/${id}`, { headers: authHeader() })
      .then(r => r.data).catch(e => apiError<void>(e, "Failed to delete"));
  },
  async addToWatchList(id, userId){
    return axios.post<ApiResponse<UserWatchlistDto>>(`${BASE}/${id}/watch`,{ userId },{ headers: authHeader() })
      .then(r => r.data).catch(e => apiError<UserWatchlistDto>(e, "Failed to add to watchlist"));
  },
  async removeFromWatchList(id, userId){
    return axios.delete<ApiResponse<void>>(`${BASE}/${id}/watch`, {headers: authHeader(), data: { userId }})
      .then(r => r.data).catch(e => apiError<void>(e, "Failed to remove from watchlist"));
},
  async findWatchListItem(payload){
    return axios.post<ApiResponse<boolean>>(`${BASE}/watch/check`, payload, { headers: authHeader() })
      .then(r => r.data).catch(e => apiError<boolean>(e, "Failed to check watchlist item"));
  }
}