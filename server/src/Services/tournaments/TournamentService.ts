import { CreateTournamentDto } from "../../Domain/DTOs/tournaments/CreateTournamentDto";
import { CreateTournamentInternalDto } from "../../Domain/DTOs/tournaments/CreateTournamentInternalDto";
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
import { TournamentFilterInternalDto } from "../../Domain/DTOs/tournaments/TournamentFilterInternalDto";
import { Game } from "../../Domain/models/Game";

export class TournamentService implements ITournamentService {
  public constructor(
    private readonly tournamentRepo: ITournamentRepository,
    private readonly gameRepo: IGameRepository,
    private readonly logger: ILoggerService,
    private readonly dateTimeConverter: IDateTimeConverter,
  ) {}

  async getAll(page?: number, limit?: number): Promise<PaginatedListDto<TournamentDto>> {
    const tournaments = await this.tournamentRepo.findAll(page, limit);
    if (!tournaments) {
      return new PaginatedListDto([], 0, page, limit);
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

    return new PaginatedListDto(items, total, page, limit);
  }

  async getFiltered(fields: Partial<TournamentFilterDto>, page?: number, limit?: number): Promise<PaginatedListDto<TournamentDto>> {
    
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
    return new PaginatedListDto(items, total, page, limit);
  }

  async getById(id: number): Promise<TournamentDto | null> {
    const tournament = await this.tournamentRepo.findById(id);
    if (!tournament) {
      return null;
    }

    const game = await this.gameRepo.findById(tournament.tournamentGameId);
    if (!game) {
      this.logger.error("TournamentService", "getById failed", `Game with id "${tournament.tournamentGameId}" not found`);
      return null;
    }

    return new TournamentDto(
      tournament.tournamentName,
      game.gameName,
      tournament.tournamentFormat,
      tournament.tournamentMaxTeams,
      tournament.tournamentApplicationDeadline,
      tournament.tournamentPrizeFund,
      tournament.tournamentStatus
    );
  }

  async create(t: CreateTournamentDto): Promise<Tournament | null> {
    // find game by name
    const game = await this.gameRepo.findByName(t.tournamentGame);
    if (!game) {
      this.logger.error("TournamentService", "create failed", `Game with name "${t.tournamentGame}" not found`);
      return null;
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

    const created = await this.tournamentRepo.create(newTournament);
    return created.tournamentId !== 0 ? created : null;
  }

  async update(id: number, fields: Partial<Tournament>): Promise<boolean> {
    return this.tournamentRepo.update(id, fields);
  }

  async delete(id: number): Promise<boolean> {
    return this.tournamentRepo.delete(id);
  }
}
