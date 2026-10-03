import axios from "axios";
import type { AuthResponse } from "../../types/auth/AuthResponse";
import type { IAuthAPIService } from "./IAuthAPIService";
import { apiError } from "../apiResponse";

const BASE = import.meta.env.VITE_API_URL + "auth";
export const authApi: IAuthAPIService = {
  async login(username, password) {
    return axios.post<AuthResponse>(`${BASE}/login`, { username, password })
      .then(r => r.data).catch(e => apiError<string>(e, "Login failed"));
  },
  async register(username, email, password, fullName, profilePicture, role) {
    return axios.post<AuthResponse>(`${BASE}/register`, { username, email, password, fullName, profilePicture, role })
      .then(r => r.data).catch(e => apiError<string>(e, "Registration failed"));
  },
  async logout(id) {
    return axios.post<AuthResponse>(`${BASE}/logout`, { id })
      .then(r => r.data).catch(e => apiError<string>(e, "Failed to regulate activity of user"));
  }
};
