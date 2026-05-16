import { HealthStatusDto } from "../../DTOs/health/HealthStatusDto";
import { StatisticsDto } from "../../DTOs/statistics/StatisticsDto";
import { ApiHealthDto } from "../../DTOs/health/ApiHealthDto" 
export interface IHealthService {
  getDbStatus(): HealthStatusDto;
  runHealthCheck(): Promise<void>;
  getApiStatus(): ApiHealthDto;
  runApiCheck(): Promise<void>;
  getStatistics(): Promise<StatisticsDto>;
}