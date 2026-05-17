import axios from "axios";
import { readItem } from "../../helpers/local_storage";
import type { ApiResponse, ITournamentRegistrationAPIService } from "./ITournamentRegistrationAPIService";
import type { TournamentRegistrationDto } from "../../models/tournamentRegistration/TournamentRegistrationDto";

const BASE = import.meta.env.VITE_API_URL + "tournaments";

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const err = <T>(e: unknown, fallback: string): ApiResponse<T> => ({
  success: false,
  message: axios.isAxiosError(e) ? (e.response?.data as { message?: string })?.message ?? fallback : fallback,
});

export const tournamentRegistrationApi : ITournamentRegistrationAPIService = {
    async getByTournamentId(id = 0, page = 1, limit = 20){
        return axios.get(`${BASE}/${id}/registered?page=${page}&limit=${limit}`, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to load items"));
    },
    async registerTournament(id, payload){
        return axios.post<ApiResponse<TournamentRegistrationDto>>(`${BASE}/${id}/register`, payload, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to create"));
    },
    async delete(tournamentId, teamId){
        return axios.delete<ApiResponse<void>>(`${BASE}/${tournamentId}/register/${teamId}`, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to delete"));
    },
    async update(tournamentId, teamId, payload){
        return axios.patch<ApiResponse<void>>(`${BASE}/${tournamentId}/registrations/${teamId}`, payload, { headers: authHeader() })
      .then(r => r.data).catch(e => err(e, "Failed to update"));
    }
}

