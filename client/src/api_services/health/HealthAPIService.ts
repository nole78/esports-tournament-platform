import axios from "axios";
import type { IHealthAPIService, ApiResponse } from "./IHealthAPIService";
import type { StatisticsDto } from "../../models/health/StatisticsDto";
import type { HealthStatusDto } from "../../models/health/HealthStatusDto";
import type { ApiStatusDto } from "../../models/health/ApiStatusDto";

const BASE = import.meta.env.VITE_API_URL;
const h = (t: string) => ({ Authorization: `Bearer ${t}` });
const fail = <T>(e: unknown): ApiResponse<T> => ({ success: false, message: "Error: " + e });

export const healthApi: IHealthAPIService = {
  getDbStatus: (t) => axios.get<ApiResponse<HealthStatusDto>>(`${BASE}health/db`, { headers: h(t) }).then(r => r.data).catch(e => fail(e)),
  runCheck: (t) => axios.post<ApiResponse<HealthStatusDto>>(`${BASE}health/db/check`, {}, { headers: h(t) }).then(r => r.data).catch(e => fail(e)),
  getApiStatus: (t) => axios.get<ApiResponse<ApiStatusDto[]>>(`${BASE}health/api`, { headers: h(t) }).then(r => r.data).catch(e => fail(e)),
  getStatistics: (t) => axios.get<ApiResponse<StatisticsDto>>(`${BASE}statistics`, { headers: h(t) }).then(r => r.data).catch(e => fail(e)),
};