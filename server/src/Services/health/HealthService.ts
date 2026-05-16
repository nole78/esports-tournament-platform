import { IHealthService } from "../../Domain/services/health/IHealthService";
import { IGameRepository } from "../../Domain/repositories/games/IGameRepository";
import { ITournamentRepository } from "../../Domain/repositories/tournaments/ITournamentRepository";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { StatisticsDto } from "../../Domain/DTOs/statistics/StatisticsDto";
import { DbManager } from "../../Database/connection/DbConnectionPool";
import { logger } from '../../app';
import { HealthStatusDto } from "../../Domain/DTOs/health/HealthStatusDto";
import { ApiHealthDto } from "../../Domain/DTOs/health/ApiHealthDto";
import { NodeStatusDto } from "../../Domain/DTOs/health/NodeStatusDto";
import { ApiStatusDto } from "../../Domain/DTOs/health/ApiStatusDto";
import { ApiStatus } from "../../Domain/enums/ApiStatus";
import { HEALTH_CHECK_INTERVAL_MS, HEALTH_CHECK_TIMEOUT } from "../../Domain/constants/Constants";

//Add other repos

export class HealthService implements IHealthService {
  public constructor(
    private readonly gameRepo: IGameRepository,
    private readonly tournamentRepo: ITournamentRepository,
    private readonly userRepo: IUserRepository,
    private readonly db: DbManager
  ) {}

  private apiNodes: ApiStatusDto[] = [];

  getDbStatus(): HealthStatusDto {
    const start = Date.now();
    const nodes = this.db.getNodes().map((n) =>
        new NodeStatusDto(n.name, n.host, n.port, n.status, n.lastCheck, n.successfulWrites, n.failedWrites, n.latency)
    );
    return new HealthStatusDto(nodes, this.db.getSlaveRrIndex());
  }

  async runHealthCheck(): Promise<void> {
    await this.db.runHealthCheck();
  }

  async runApiCheck(): Promise<void> {
  const nodes = [
    { name: "users-api", url: "http://localhost:4000/api/v1/users" },
    { name: "tournaments-api", url: "http://localhost:4000/api/v1/tournaments" },
    { name: "games-api", url: "http://localhost:4000/api/v1/games" },
    { name: "audit_log-api", url: "http://localhost:4000/api/v1/audit_log" },
  ];

  const results = await Promise.all(
    nodes.map(async (node) => {
      const start = Date.now();

      try {
        const res = await fetch(node.url);
        const latency = Date.now() - start;
        if(res.status < 404)
        {
          return new ApiStatusDto(
          node.name,
          node.url,
          latency < HEALTH_CHECK_TIMEOUT ? ApiStatus.HEALTHY : ApiStatus.DEGRADED,
          new Date(),
          latency
        );
        }
        else
        {
            return new ApiStatusDto(
            node.name,
            node.url,
            ApiStatus.UNREACHABLE,
            new Date(),
            -1
          );
        }
      } catch {
        return new ApiStatusDto(
          node.name,
          node.url,
          ApiStatus.UNREACHABLE,
          new Date(),
          -1
        );
      }
    })
  );

  this.apiNodes = results;
}

  getApiStatus(): ApiHealthDto {
    return new ApiHealthDto(this.apiNodes ?? []);
}
  // Change later when other repos are implemented
  async getStatistics(): Promise<StatisticsDto> {
    const games = await this.gameRepo.getTotal();
    const tournaments = await this.tournamentRepo.findAll(); //Change later for getTotal
    const users = await this.userRepo.findAll();
    const matches = 0;
    const teams = 0;
    return new StatisticsDto(
      users.length, games, tournaments.items.length, teams, matches
    );
  }
}