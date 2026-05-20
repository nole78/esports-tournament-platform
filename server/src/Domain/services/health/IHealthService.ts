import { HealthStatusDto } from "../../DTOs/health/HealthStatusDto";
import { StatisticsDto } from "../../DTOs/statistics/StatisticsDto";
import { Result } from "../../common/Result";
export interface IHealthService {
  getDbStatus(): Result<HealthStatusDto>;
  getStatistics(): Promise<Result<StatisticsDto>>;
}