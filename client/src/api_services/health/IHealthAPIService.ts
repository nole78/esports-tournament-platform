import type { StatisticsDto } from "../../models/health/StatisticsDto";
import type { HealthStatusDto } from "../../models/health/HealthStatusDto";
import type { ApiStatusDto } from "../../models/health/ApiStatusDto";
import type { ApiResponse } from "../users/IUsersAPIService";

export interface IHealthAPIService {
  getDbStatus(): Promise<ApiResponse<HealthStatusDto>>;
  getApiStatus(): Promise<ApiResponse<ApiStatusDto[]>>;
  getStatistics(): Promise<ApiResponse<StatisticsDto>>;
}
