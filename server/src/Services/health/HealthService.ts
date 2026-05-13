import { IHealthService } from "../../Domain/services/health/IHealthService";
import { IGameRepository } from "../../Domain/repositories/games/IGameRepository";
import { ITournamentRepository } from "../../Domain/repositories/tournaments/ITournamentRepository";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { HealthStatusDto } from "../../Domain/DTOs/health/HealthStatusDto";
import { NodeStatusDto } from "../../Domain/DTOs/health/NodeStatusDto";
import { StatisticsDto } from "../../Domain/DTOs/statistics/StatisticsDto";
import { DbManager } from "../../Database/connection/DbConnectionPool";
import { logger } from '../../app';

//Add other repos

export class HealthService implements IHealthService {
  public constructor(
    private readonly gameRepo: IGameRepository,
    private readonly tournamentRepo: ITournamentRepository,
    private readonly userRepo: IUserRepository,
    private readonly db: DbManager
  ) {}

  getDbStatus(): HealthStatusDto {
    const nodes = this.db.getNodes().map((n) =>
      new NodeStatusDto(n.name, n.host, n.port, n.status, n.lastCheck, n.successfulWrites, n.failedWrites)
    );
    return new HealthStatusDto(nodes, this.db.getSlaveRrIndex());
  }

  async runHealthCheck(): Promise<void> {
    await this.db.runHealthCheck();
  }

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