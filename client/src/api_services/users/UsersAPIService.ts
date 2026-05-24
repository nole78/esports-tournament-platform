import axios from "axios";
import type { IUsersAPIService } from "./IUsersAPIService";
import type { UserDto } from "../../models/user/UserTypes";
import { readItem } from "../../helpers/local_storage";
import type { ApiResponse } from "../tournament_list/ITournamentAPIService";

const BASE = import.meta.env.VITE_API_URL + "users";

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const err = <T>(e: unknown, fallback: string): ApiResponse<T> => ({
  success: false,
  message: axios.isAxiosError(e) ? (e.response?.data as { message?: string })?.message ?? fallback : fallback,
});

export const usersApi: IUsersAPIService = {
  async getAll() {
    return axios.get<ApiResponse<UserDto[]>>(BASE, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to load users"));
  },
  async getById(id) {
    return axios.get<ApiResponse<UserDto>>(`${BASE}/${id}`, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to load user"));
  },
  async changeRole(id, role) {
    return axios.patch<ApiResponse<void>>(`${BASE}/${id}/role`, role, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to deactivate user"));
  }
};
