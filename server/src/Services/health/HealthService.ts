import { IHealthService } from "../../Domain/services/health/IHealthService";
import { IGameRepository } from "../../Domain/repositories/games/IGameRepository";
import { ITournamentRepository } from "../../Domain/repositories/tournaments/ITournamentRepository";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { HealthStatus } from "../../Domain/models/HealthStatus";
import { DbNode } from "../../Domain/models/DbNode";
import { Statistics } from "../../Domain/models/Statistics";
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

  getDbStatus(): HealthStatus {
    const start = Date.now();
    const nodes = this.db.getNodes().map((n) => {
            const node = new DbNode(n.name, n.host, n.port)
            node.failedWrites = n.failedWrites;
            node.lastCheck = n.lastCheck;
            node.status = n.status;
            node.successfulWrites = n.successfulWrites;
            node.latency = Date.now() - start;
            return node;
        }
    );
    return new HealthStatus(nodes, this.db.getSlaveRrIndex());
  }

  async runHealthCheck(): Promise<void> {
    await this.db.runHealthCheck();
  }
  // Change later when other repos are implemented
  async getStatistics(): Promise<Statistics> {
    const games = await this.gameRepo.getTotal();
    const tournaments = await this.tournamentRepo.findAll(); //Change later for getTotal
    const users = await this.userRepo.findAll();
    const matches = 0;
    const teams = 0;
    return new Statistics(
      users.length, games, tournaments.items.length, teams, matches
    );
  }
}