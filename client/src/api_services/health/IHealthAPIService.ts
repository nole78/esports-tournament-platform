import type { StatisticsDto } from "../../models/health/StatisticsDto";
import type { HealthStatusDto } from "../../models/health/HealthStatusDto";
import type { ApiHealthDto } from "../../models/health/ApiHealthDto";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface IHealthAPIService {
  getDbStatus(token: string): Promise<ApiResponse<HealthStatusDto>>;
  runCheck(token: string): Promise<ApiResponse<HealthStatusDto>>;
  getApiStatus(token: string): Promise<ApiResponse<ApiHealthDto>>;
  runApiCheck(token: string): Promise<ApiResponse<ApiHealthDto>>;
  getStatistics(token: string): Promise<ApiResponse<StatisticsDto>>;
}
