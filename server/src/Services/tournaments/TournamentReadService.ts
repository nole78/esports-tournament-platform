import { ErrorType } from "../../Domain/common/ErrorType";
import { Result } from "../../Domain/common/Result";
import { GameDto } from "../../Domain/DTOs/games/GameDto";
import { PaginatedListDto } from "../../Domain/DTOs/PaginatedListDto";
import { TournamentDto } from "../../Domain/DTOs/tournaments/TorunamentDto";
import { TournamentFilterDto } from "../../Domain/DTOs/tournaments/TournamentFilterDto";
import { Game } from "../../Domain/models/Game";
import { IGameReadRepository } from "../../Domain/repositories/games/IGameReadRepository";
import { ITournamentReadRepository } from "../../Domain/repositories/tournaments/ITournamentReadRepository";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";
import { ITournamentReadService } from "../../Domain/services/tournaments/ITournamentReadService";

export class TournamentReadService implements ITournamentReadService {
  public constructor(
    private readonly tournamentReadRepo: ITournamentReadRepository,
    private readonly gameReadRepo: IGameReadRepository,
    private readonly logger: ILoggerService,
  ) {}

  async getAll(page?: number, limit?: number): Promise<Result<PaginatedListDto<TournamentDto>>> {
    const tournaments = await this.tournamentReadRepo.findAll(page, limit);
    if (!tournaments) {
      return Result.Failure("There are no tournaments!", ErrorType.NotFound);
    }

    const gameIds = [...new Set(tournaments.map(t => t.tournamentGameId))];
    const games:Game[] = [];
    
    for(let i:number = 0; i < gameIds.length; i++)
    {
      const game = await this.gameReadRepo.findById(gameIds[i]);
      if(game)
        games.push(game);
    }

    const gameMap = new Map(games.map(g => [g.gameId, g.gameName]));
    
    
    const items = tournaments.map(t => 
      new TournamentDto(
        t.tournamentId,
        t.tournamentName,
        gameMap.get(t.tournamentGameId) || "N/A",
        t.tournamentFormat,
        t.tournamentMaxTeams,
        t.tournamentApplicationDeadline,
        t.tournamentPrizeFund,
        t.tournamentStatus
      )
    );

    const total = await this.tournamentReadRepo.findTotal();

    return Result.Success(new PaginatedListDto(items, total, page, limit));
  }

  async getFiltered(fields: Partial<TournamentFilterDto>, page?: number, limit?: number): Promise<Result<PaginatedListDto<TournamentDto>>> {
    
    let game:GameDto = new GameDto();
    if(fields.tournamentGame)
    {
      game = await this.gameReadRepo.findByName(fields.tournamentGame);
    }
    
    const tournaments = await this.tournamentReadRepo.findFiltered(game?.gameId == 0 ? 0 : game?.gameId, fields?.tournamentFormat, fields?.tournamentStatus, page, limit);

    const gameIds = [...new Set(tournaments.map(t => t.tournamentGameId))];
    const games:GameDto[] = [];
    
    for(let i:number = 0; i < gameIds.length; i++)
    {
      const game = await this.gameReadRepo.findById(gameIds[i]);
      if(game)
        games.push(game);
    }

    const gameMap = new Map(games.map(g => [g.gameId, g.gameName]));

    const items = tournaments.map(t => 
      new TournamentDto(
        t.tournamentId,
        t.tournamentName,
        gameMap.get(t.tournamentGameId) || "N/A",
        t.tournamentFormat,
        t.tournamentMaxTeams,
        t.tournamentApplicationDeadline,
        t.tournamentPrizeFund,
        t.tournamentStatus
      )
    );
    const total = await this.tournamentReadRepo.findTotalFiltered(game?.gameId == 0 ? 0 : game?.gameId, fields?.tournamentFormat, fields?.tournamentStatus);
    return Result.Success(new PaginatedListDto(items, total, page, limit));
  }

  async getById(id: number): Promise<Result<TournamentDto>> {
    const tournament = await this.tournamentReadRepo.findById(id);
    if (!tournament) {
      return Result.Failure("Tournament with id "+id+" does not exist!", ErrorType.NotFound);
    }

    const game = await this.gameReadRepo.findById(tournament.tournamentGameId);
    if (!game) {
      this.logger.error("TournamentService", "getById failed", new Error(`Game with id "${tournament.tournamentGameId}" not found`));
      return Result.Failure("Game with id " + tournament.tournamentGameId + " does not exist!", ErrorType.NotFound);
    }

    return Result.Success(new TournamentDto(
      tournament.tournamentId,
      tournament.tournamentName,
      game.gameName,
      tournament.tournamentFormat,
      tournament.tournamentMaxTeams,
      tournament.tournamentApplicationDeadline,
      tournament.tournamentPrizeFund,
      tournament.tournamentStatus
    ));
  }
}