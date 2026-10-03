import axios from "axios";
import type { IUserWatchListAPIService, ApiResponse } from "./IUserWatchlistAPIService";
import type { UserWatchlistDto } from "../../models/user_watchlist/UserWatchlistDto";
import { readItem } from "../../helpers/local_storage";
import { apiError } from "../apiResponse";

const BASE = import.meta.env.VITE_API_URL + "watchlist";

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const userWatchlistApi: IUserWatchListAPIService = {
    async getById(id, page = 1, limit = 20){
    return axios.post(`${BASE}?page=${page}&limit=${limit}`, { id }, { headers: authHeader() })
      .then(r => r.data).catch(e => apiError<{ items: UserWatchlistDto[]; total: number }>(e, "Failed to load items"));
    },
    async delete(id, tournamentId){
        return axios.delete<ApiResponse<void>>(`${BASE}/${tournamentId}`, { headers: authHeader(), data: { id } })
      .then(r => r.data).catch(e => apiError<void>(e, "Failed to delete"));
    }
};