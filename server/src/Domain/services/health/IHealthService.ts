import { HealthStatusDto } from "../../DTOs/health/HealthStatusDto";
import { StatisticsDto } from "../../DTOs/statistics/StatisticsDto";
import { ApiHealthDto } from "../../DTOs/health/ApiHealthDto" 
import { Result } from "../../common/Result";
export interface IHealthService {
  getDbStatus(): Result<HealthStatusDto>;
  runHealthCheck(): Promise<Result<void>>;
  getApiStatus(): Result<ApiHealthDto>;
  runApiCheck(): Promise<Result<void>>;
  getStatistics(): Promise<Result<StatisticsDto>>;
}