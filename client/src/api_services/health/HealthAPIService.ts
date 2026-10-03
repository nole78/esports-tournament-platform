import axios from "axios";
import type { IHealthAPIService } from "./IHealthAPIService";
import type { HealthStatusDto } from "../../models/health/HealthStatusDto";
import type { ApiStatusDto } from "../../models/health/ApiStatusDto";
import { readItem } from "../../helpers/local_storage";
import type { ApiResponse } from "../../types/api/ApiResponse";
import { apiError } from "../apiResponse";

const BASE = import.meta.env.VITE_API_URL;

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const healthApi: IHealthAPIService = {
  getDbStatus: () => axios.get<ApiResponse<HealthStatusDto>>(`${BASE}health/db`, { headers: authHeader() }).then(r => r.data).catch(e => apiError<HealthStatusDto>(e, "Failed to load database health")),
  getApiStatus: () => axios.get<ApiResponse<ApiStatusDto[]>>(`${BASE}health/api`, { headers: authHeader() }).then(r => r.data).catch(e => apiError<ApiStatusDto[]>(e, "Failed to load API health")),
};