import { IHealthService } from "../../Domain/services/health/IHealthService";
import { IGameRepository } from "../../Domain/repositories/games/IGameRepository";
import { ITournamentRepositoryRead } from "../../Domain/repositories/tournaments/ITournamentRepositoryRead";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { ITeamRepository } from "../../Domain/repositories/teams/ITeamRepository";
import { StatisticsDto } from "../../Domain/DTOs/statistics/StatisticsDto";
import { DbManager } from "../../Database/connection/DbConnectionPool";
import { HealthStatusDto } from "../../Domain/DTOs/health/HealthStatusDto";
import { NodeStatusDto } from "../../Domain/DTOs/health/NodeStatusDto";
import { Result } from "../../Domain/common/Result";

//Add other repos

export class HealthService implements IHealthService {
  public constructor(
    private readonly gameRepo: IGameRepository,
    private readonly tournamentRepoRead: ITournamentRepositoryRead,
    private readonly userRepo: IUserRepository,
    private readonly teamRepo: ITeamRepository,
    private readonly db: DbManager
  ) {}

  getDbStatus(): Result<HealthStatusDto> {
    const nodes = this.db.getNodes().map((n) =>
        new NodeStatusDto(n.name, n.host, n.port, n.status, n.lastCheck, n.successfulReads, n.failedReads, n.successfulWrites, n.failedWrites, n.latency)
    );
    return Result.Success(new HealthStatusDto(nodes, this.db.getSlaveRrIndex()));
  }

  // Change later when other repos are implemented
  async getStatistics(): Promise<Result<StatisticsDto>> {
    const games = await this.gameRepo.getTotal();
    const tournaments = await this.tournamentRepoRead.findAll(); //Change later for getTotal
    const users = await this.userRepo.findAll();
    const teams = await this.teamRepo.findAll();
    const matches = 0;
    return Result.Success(new StatisticsDto(
      users.length, games, tournaments.length , teams.length, matches
    ));
  }
}