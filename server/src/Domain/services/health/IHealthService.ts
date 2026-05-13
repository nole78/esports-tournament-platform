import { HealthStatus } from "../../models/HealthStatus";
import { Statistics } from "../../models/Statistics";
export interface IHealthService {
  getDbStatus(): HealthStatus;
  runHealthCheck(): Promise<void>;
  getStatistics(): Promise<Statistics>;
}