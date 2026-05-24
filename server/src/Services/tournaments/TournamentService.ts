import { CreateTournamentDto } from "../../Domain/DTOs/tournaments/CreateTournamentDto";
import { TournamentDto } from "../../Domain/DTOs/tournaments/TorunamentDto";
import { PaginatedListDto } from "../../Domain/DTOs/PaginatedListDto";
import { Tournament } from "../../Domain/models/Tournament";
import { ITournamentRepository } from "../../Domain/repositories/tournaments/ITournamentRepository";
import { IGameRepository } from "../../Domain/repositories/games/IGameRepository";
import { ITournamentService } from "../../Domain/services/tournaments/ITournamentService";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";
import { IDateTimeConverter } from "../../Domain/services/datetime/IDateTimeConverter";
import { GameDto } from "../../Domain/DTOs/games/GameDto";
import { TournamentFilterDto } from "../../Domain/DTOs/tournaments/TournamentFilterDto";
import { Game } from "../../Domain/models/Game";
import { Result } from "../../Domain/common/Result";
import { ErrorType } from '../../Domain/common/ErrorType';

export class TournamentService implements ITournamentService {
  public constructor(
    private readonly tournamentRepo: ITournamentRepository,
    private readonly gameRepo: IGameRepository,
    private readonly logger: ILoggerService,
    private readonly dateTimeConverter: IDateTimeConverter,
  ) {}

  async getAll(page?: number, limit?: number): Promise<Result<PaginatedListDto<TournamentDto>>> {
    const tournaments = await this.tournamentRepo.findAll(page, limit);
    if (!tournaments) {
      return Result.Failure("There are no tournaments!", ErrorType.NotFound);
    }

    const gameIds = [...new Set(tournaments.map(t => t.tournamentGameId))];
    const games:Game[] = [];
    
    for(let i:number = 0; i < gameIds.length; i++)
    {
      const game = await this.gameRepo.findById(gameIds[i]);
      if(game != null)
        games.push(game);
    }

    const gameMap = new Map(games.map(g => [g.gameId, g.gameName]));
    
    
    const items = tournaments.map(t => 
      new TournamentDto(
        t.tournamentId,
        t.tournamentName,
        gameMap.get(t.tournamentGameId) || "Unknown",
        t.tournamentFormat,
        t.tournamentMaxTeams,
        t.tournamentApplicationDeadline,
        t.tournamentPrizeFund,
        t.tournamentStatus
      )
    );

    const total = await this.tournamentRepo.findTotal();

    return Result.Success(new PaginatedListDto(items, total, page, limit));
  }

  async getFiltered(fields: Partial<TournamentFilterDto>, page?: number, limit?: number): Promise<Result<PaginatedListDto<TournamentDto>>> {
    
    let game:GameDto|null = new GameDto();
    if(fields.tournamentGame != null)
    {
      game = await this.gameRepo.findByName(fields.tournamentGame);
    }
    
    const tournaments = await this.tournamentRepo.findFiltered(game?.gameId == 0 ? undefined : game?.gameId, fields?.tournamentFormat, fields?.tournamentStatus, page, limit);

    const gameIds = [...new Set(tournaments.map(t => t.tournamentGameId))];
    const games:GameDto[] = [];
    
    for(let i:number = 0; i < gameIds.length; i++)
    {
      const game = await this.gameRepo.findById(gameIds[i]);
      if(game != null)
        games.push(game);
    }

    const gameMap = new Map(games.map(g => [g.gameId, g.gameName]));

    const items = tournaments.map(t => 
      new TournamentDto(
        t.tournamentId,
        t.tournamentName,
        gameMap.get(t.tournamentGameId) || "Unknown",
        t.tournamentFormat,
        t.tournamentMaxTeams,
        t.tournamentApplicationDeadline,
        t.tournamentPrizeFund,
        t.tournamentStatus
      )
    );
    const total = await this.tournamentRepo.findTotalFiltered(game?.gameId == 0 ? undefined : game?.gameId, fields?.tournamentFormat, fields?.tournamentStatus);
    return Result.Success(new PaginatedListDto(items, total, page, limit));
  }

  async getById(id: number): Promise<Result<TournamentDto>> {
    const tournament = await this.tournamentRepo.findById(id);
    if (!tournament) {
      return Result.Failure("Tournament with id "+id+" does not exist!", ErrorType.NotFound);
    }

    const game = await this.gameRepo.findById(tournament.tournamentGameId);
    if (!game) {
      this.logger.error("TournamentService", "getById failed", `Game with id "${tournament.tournamentGameId}" not found`);
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

  async create(t: CreateTournamentDto): Promise<Result<TournamentDto>> {
    // find game by name
    const game = await this.gameRepo.findByName(t.tournamentGame);
    if (!game) {
      this.logger.error("TournamentService", "create failed", `Game with name "${t.tournamentGame}" not found`);
      return Result.Failure("Game with name "+t.tournamentGame+" does not exist!", ErrorType.NotFound);
    }

    // Conver date to MySQL format
    const formattedDeadline = this.dateTimeConverter.toMySQLDateTime(
      t.tournamentApplicationDeadline
    );

    const newTournament = new Tournament(
      0,
      t.tournamentName,
      game.gameId,
      t.tournamentFormat,
      t.tournamentMaxTeams,
      new Date(formattedDeadline),
      t.tournamentPrizeFund,
      t.tournamentStatus,
    );

    const created:Tournament = await this.tournamentRepo.create(newTournament);

    const newTournamentDto:TournamentDto = new TournamentDto(created.tournamentId, created.tournamentName, game.gameName, created.tournamentFormat, created.tournamentMaxTeams, created.tournamentApplicationDeadline, created.tournamentPrizeFund, created.tournamentStatus);

    return created.tournamentId !== 0 ? Result.Success(newTournamentDto) : Result.Failure("Could not create new tournament!", ErrorType.Internal);
  }

  async update(id: number, fields: TournamentDto): Promise<Result<void>> {
    const t = await this.tournamentRepo.findById(id);
    if(t.tournamentId === 0)
      return Result.Failure("Tournament with id "+id+"does not exist!", ErrorType.NotFound);
    
    const updatedTournament:Partial<Tournament> = {
      tournamentName: fields.tournamentName,
      tournamentFormat: fields.tournamentFormat,
      tournamentMaxTeams: fields.tournamentMaxTeams,
      tournamentApplicationDeadline: new Date(this.dateTimeConverter.toMySQLDateTime(fields.tournamentApplicationDeadline)),
      tournamentPrizeFund: fields.tournamentPrizeFund,
      tournamentStatus: fields.tournamentStatus
    }
    const res = await this.tournamentRepo.update(id, updatedTournament)
    return res? Result.Success():Result.Failure("Could not update tournament!", ErrorType.Internal);
  }

  async delete(id: number): Promise<Result<void>> {
    const t = await this.tournamentRepo.findById(id);
    if(t.tournamentId === 0)
      return Result.Failure("Tournament with id "+id+"does not exist!", ErrorType.NotFound);
    const res = await this.tournamentRepo.delete(id);
    return res? Result.Success(): Result.Failure("Could not delete tournament!", ErrorType.Internal);
  }
}
