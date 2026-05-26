import axios from "axios";
import type { IHealthAPIService } from "./IHealthAPIService";
import type { StatisticsDto } from "../../models/health/StatisticsDto";
import type { HealthStatusDto } from "../../models/health/HealthStatusDto";
import type { ApiStatusDto } from "../../models/health/ApiStatusDto";
import { readItem } from "../../helpers/local_storage";
import type { ApiResponse } from "../tournament_list/ITournamentAPIService";

const BASE = import.meta.env.VITE_API_URL;
const err = <T>(e: Error): ApiResponse<T> => ({ success: false, message: "Error: " + e.message });

const authHeader = () => {
  const token = readItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const healthApi: IHealthAPIService = {
  getDbStatus: () => axios.get<ApiResponse<HealthStatusDto>>(`${BASE}health/db`, { headers: authHeader() }).then(r => r.data).catch(e => err(e)),
  getApiStatus: () => axios.get<ApiResponse<ApiStatusDto[]>>(`${BASE}health/api`, { headers: authHeader() }).then(r => r.data).catch(e => err(e)),
  getStatistics: () => axios.get<ApiResponse<StatisticsDto>>(`${BASE}statistics`, { headers: authHeader() }).then(r => r.data).catch(e => err(e)),
};