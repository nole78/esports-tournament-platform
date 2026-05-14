import type { StatisticsDto } from "../../models/health/StatisticsDto";
import type { HealthStatusDto } from "../../models/health/HealthStatusDto";

export type ApiResponse<T> = { success: boolean; message: string; data?: T };

export interface IHealthAPIService {
  getDbStatus(token: string): Promise<ApiResponse<HealthStatusDto>>;
  runCheck(token: string): Promise<ApiResponse<HealthStatusDto>>;
  getStatistics(token: string): Promise<ApiResponse<StatisticsDto>>;
}
