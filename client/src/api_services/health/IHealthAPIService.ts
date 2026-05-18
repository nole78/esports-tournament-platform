import type { StatisticsDto } from "../../models/health/StatisticsDto";
import type { HealthStatusDto } from "../../models/health/HealthStatusDto";
import type { ApiStatusDto } from "../../models/health/ApiStatusDto";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface IHealthAPIService {
  getDbStatus(token: string): Promise<ApiResponse<HealthStatusDto>>;
  runCheck(token: string): Promise<ApiResponse<HealthStatusDto>>;
  getApiStatus(token: string): Promise<ApiResponse<ApiStatusDto[]>>;
  getStatistics(token: string): Promise<ApiResponse<StatisticsDto>>;
}
