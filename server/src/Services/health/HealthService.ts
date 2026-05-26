import { IHealthService } from "../../Domain/services/health/IHealthService";
import { IGameRepository } from "../../Domain/repositories/games/IGameRepository";
import { ITournamentReadRepository } from "../../Domain/repositories/tournaments/ITournamentReadRepository";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { StatisticsDto } from "../../Domain/DTOs/statistics/StatisticsDto";
import { DbManager } from "../../Database/connection/DbConnectionPool";
import { HealthStatusDto } from "../../Domain/DTOs/health/HealthStatusDto";
import { NodeStatusDto } from "../../Domain/DTOs/health/NodeStatusDto";
import { Result } from "../../Domain/common/Result";
import { ITeamRepositoryRead } from "../../Domain/repositories/teams/ITeamRepositoryRead";

//Add other repos

export class HealthService implements IHealthService {
  public constructor(
    private readonly gameRepo: IGameRepository,
    private readonly tournamentReadRepo: ITournamentReadRepository,
    private readonly userRepo: IUserRepository,
    private readonly teamRepoRead: ITeamRepositoryRead,
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
    const tournaments = await this.tournamentReadRepo.findAll(); //Change later for getTotal
    const users = await this.userRepo.findAll();
    const teams = await this.teamRepoRead.findAll();
    const matches = 0;
    return Result.Success(new StatisticsDto(
      users.length, games, tournaments.length , teams.length, matches
    ));
  }
}