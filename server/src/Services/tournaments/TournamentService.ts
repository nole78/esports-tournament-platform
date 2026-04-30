import { CreateTournamentDto } from "../../Domain/DTOs/tournaments/CreateTournamentDto";
import { CreateTournamentInternalDto } from "../../Domain/DTOs/tournaments/CreateTournamentInternalDto";
import { TournamentDto } from "../../Domain/DTOs/tournaments/TorunamentDto";
import { PaginatedListDto } from "../../Domain/DTOs/PaginatedListDto";
import { Tournament } from "../../Domain/models/Tournament";
import { ITournamentRepository } from "../../Domain/repositories/tournaments/ITournamentRepository";
import { IGameRepository } from "../../Domain/repositories/games/IGameRepository";
import { ITournamentService } from "../../Domain/services/tournaments/ITournamentService";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";

export class TournamentService implements ITournamentService {
  public constructor(
    private readonly tournamentRepo: ITournamentRepository,
    private readonly gameRepo: IGameRepository,
    private readonly logger: ILoggerService,
  ) {}

  async getAll(page?: number, limit?: number): Promise<PaginatedListDto<TournamentDto>> {
    const items = await this.tournamentRepo.findAll(page, limit);
    return new PaginatedListDto(items, items.length, page, limit);
  }

  async getById(id: number): Promise<TournamentDto | null> {
    return this.tournamentRepo.findById(id);
  }

  async create(dto: CreateTournamentDto): Promise<Tournament | null> {
    // find game by name
    const game = await this.gameRepo.findByName(dto.tournamentGame);
    if (!game) {
      this.logger.error("TournamentService", "create failed", `Game with name "${dto.tournamentGame}" not found`);
      return null;
    }

    // create internal game dto with it's id
    const internalDto = new CreateTournamentInternalDto(
      dto.tournamentName,
      game.gameId,
      dto.tournamentFormat,
      dto.tournamentMaxTeams,
      dto.tournamentApplicationDeadline,
      dto.tournamentPrizeFund,
      dto.torunamentStatus,
    );

    const created = await this.tournamentRepo.create(internalDto);
    return created.tournamentId !== 0 ? created : null;
  }

  async update(id: number, fields: Partial<Tournament>): Promise<boolean> {
    return this.tournamentRepo.update(id, fields);
  }

  async delete(id: number): Promise<boolean> {
    return this.tournamentRepo.delete(id);
  }
}
