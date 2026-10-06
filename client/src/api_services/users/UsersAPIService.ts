import axios from "axios";
import type { IUsersAPIService } from "./IUsersAPIService";
import type { UserDto } from "../../models/user/UserTypes";
import { readItem } from "../../helpers/local_storage";
import type { ApiResponse } from "../tournament_list/ITournamentAPIService";
import { apiError } from "../apiResponse";

const BASE = import.meta.env.VITE_API_URL + "users";

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const usersApi: IUsersAPIService = {
  async getAll(page = 1, limit = 20): Promise<ApiResponse<{ items: UserDto[]; total: number }>> {
    return axios.get<ApiResponse<{ items: UserDto[]; total: number }>>(`${BASE}?page=${page}&limit=${limit}`, { headers: authHeader() })
      .then(r => r.data).catch(e => apiError<{ items: UserDto[]; total: number }>(e, "Failed to load users"));
  },
  async getById(id) {
    return axios.get<ApiResponse<UserDto>>(`${BASE}/${id}`, { headers: authHeader() })
      .then(r => r.data).catch(e => apiError<UserDto>(e, "Failed to load user"));
  },
  async changeRole(id, role) {
    return axios.put<ApiResponse<void>>(`${BASE}/${id}/role`, { role }, { headers: authHeader() })
      .then(r => r.data).catch(e => apiError<void>(e, "Failed to change user role"));
  },
  async searchUsername(username){
    return axios.get<ApiResponse<UserDto[]>>(`${BASE}/search/${username}`, {headers: authHeader()})
      .then(r => r.data).catch(e => apiError<UserDto[]>(e, "Failed to search users"))
  }
};
