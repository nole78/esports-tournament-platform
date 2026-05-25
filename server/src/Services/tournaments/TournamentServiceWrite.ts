import { CreateTournamentDto } from "../../Domain/DTOs/tournaments/CreateTournamentDto";
import { TournamentDto } from "../../Domain/DTOs/tournaments/TorunamentDto";
import { Tournament } from "../../Domain/models/Tournament";
import { IGameRepository } from "../../Domain/repositories/games/IGameRepository";
import { ITournamentServiceWrite } from "../../Domain/services/tournaments/ITournamentServiceWrite";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";
import { IDateTimeConverter } from "../../Domain/services/datetime/IDateTimeConverter";
import { Result } from "../../Domain/common/Result";
import { ErrorType } from '../../Domain/common/ErrorType';
import { ITournamentRepositoryRead } from "../../Domain/repositories/tournaments/ITournamentRepositoryRead";
import { ITournamentRepositoryWrite } from "../../Domain/repositories/tournaments/ITournamentRepositoryWrite";

export class TournamentServiceWrite implements ITournamentServiceWrite {
  public constructor(
    private readonly tournamentRepoRead: ITournamentRepositoryRead,
    private readonly tournamentRepoWrite: ITournamentRepositoryWrite,
    private readonly gameRepo: IGameRepository,
    private readonly logger: ILoggerService,
    private readonly dateTimeConverter: IDateTimeConverter,
  ) {}

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

    const created:Tournament = await this.tournamentRepoWrite.create(newTournament);

    const newTournamentDto:TournamentDto = new TournamentDto(created.tournamentId, created.tournamentName, game.gameName, created.tournamentFormat, created.tournamentMaxTeams, created.tournamentApplicationDeadline, created.tournamentPrizeFund, created.tournamentStatus);

    return created.tournamentId !== 0 ? Result.Success(newTournamentDto) : Result.Failure("Could not create new tournament!", ErrorType.Internal);
  }

  async update(id: number, fields: TournamentDto): Promise<Result<void>> {
    const t = await this.tournamentRepoRead.findById(id);
    if(t.tournamentId === 0)
    {
      this.logger.error("TournamentService", "update failed", `Tournament with tournamentId "${id}" not found`);
      return Result.Failure("Tournament with id "+id+"does not exist!", ErrorType.NotFound);
    }

    const updatedTournament:Partial<Tournament> = {
      tournamentName: fields.tournamentName,
      tournamentFormat: fields.tournamentFormat,
      tournamentMaxTeams: fields.tournamentMaxTeams,
      tournamentApplicationDeadline: new Date(this.dateTimeConverter.toMySQLDateTime(fields.tournamentApplicationDeadline)),
      tournamentPrizeFund: fields.tournamentPrizeFund,
      tournamentStatus: fields.tournamentStatus
    }
    const res = await this.tournamentRepoWrite.update(id, updatedTournament)
    return res? Result.Success():Result.Failure("Could not update tournament!", ErrorType.Internal);
  }

  async delete(id: number): Promise<Result<void>> {
    const t = await this.tournamentRepoRead.findById(id);
    if(t.tournamentId === 0)
    {
      this.logger.error("TournamentService", "delete failed", `Tournament with tournamentId "${id}" not found`);
      return Result.Failure("Tournament with id "+id+"does not exist!", ErrorType.NotFound);
    }
    const res = await this.tournamentRepoWrite.delete(id);
    return res? Result.Success(): Result.Failure("Could not delete tournament!", ErrorType.Internal);
  }
}
