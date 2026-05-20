import { Result } from "../../Domain/common/Result";
import { IMatchService } from "../../Domain/services/matches/IMatchService";
import { ErrorType } from '../../Domain/common/ErrorType';
import { CreateMatchDto } from "../../Domain/DTOs/matches/CreateMatchDto";
import { MatchDto } from "../../Domain/DTOs/matches/MatchDto";
import { PaginatedListDto } from "../../Domain/DTOs/PaginatedListDto";
import { Match } from '../../Domain/models/Match';
import { IMatchRepository } from '../../Domain/repositories/matches/IMatchRepository';
import { ITeamRepository } from "../../Domain/repositories/teams/ITeamRepository";
import { ITournamentRepository } from "../../Domain/repositories/tournaments/ITournamentRepository";

export class MatchService implements IMatchService{
    constructor(
        private readonly matchRepo: IMatchRepository,
        private readonly teamRepo: ITeamRepository,
        private readonly tournmaentRepo: ITournamentRepository
    ){}

    private toMatchDto(match: Match): MatchDto{
        return  new MatchDto(match.matchId, match.tournamentId, match.blueTeamId, match.redTeamId, match.matchResult, match.status, match.matchRound);
    }
    
    public async getAll(page?: number, limit?: number): Promise<Result<PaginatedListDto<MatchDto>>> {
        const result = await this.matchRepo.findAll(page,limit);
        const cnt = await this.matchRepo.getTotal();
        return Result.Success(new PaginatedListDto(result.map(m => this.toMatchDto(m)),cnt,page ?? 1,limit ?? 20))
    }

    public async getById(id: number): Promise<Result<MatchDto>> {
        const result = await this.matchRepo.findById(id);
        if(result.matchId === 0)
            return Result.Failure(`Match with id ${id} doesn't exist`,ErrorType.NotFound);
        return Result.Success(this.toMatchDto(result));
    }

    public async getByTournamentId(tournamentId: number): Promise<Result<MatchDto[]>>{
        const tournament = await this.tournmaentRepo.findById(tournamentId);
        if(tournament.tournamentId === 0)
            return Result.Failure(`Tournament with id ${tournamentId} doesn't exist`,ErrorType.NotFound);

        const result = await this.matchRepo.findByTournamentId(tournamentId);
        return  Result.Success(result);
    }

    public async getByTeamId(teamId: number): Promise<Result<MatchDto[]>> {
        // Remove comment when findByTeamId is implemented
        /*const team = await this.teamRepo.findByTeamId(teamId);
        if(team.teamId === 0)
            return Result.Failure(`Team with id ${teamId} doesn't exist`,ErrorType.NotFound);*/
        const result = await this.matchRepo.findByTeamId(teamId);
        return Result.Success(result.map(m => this.toMatchDto(m)));
    }

    public async create(dto: CreateMatchDto): Promise<Result<MatchDto>> {
        const tournament = await this.tournmaentRepo.findById(dto.tournamentId);
        if(tournament.tournamentId === 0)
            return Result.Failure("Tournament for which you want to create match for does not exist",ErrorType.NotFound);

        // TODO: Add check if teams also exist

        const result = await this.matchRepo.create(new Match(0,dto.tournamentId,dto.blueTeamId,dto.redTeamId,dto.matchResult,dto.status,dto.matchRound));
        if(result.matchId === 0)
            return Result.Failure("Couldn't create match",ErrorType.Internal);
        return Result.Success(this.toMatchDto(result));
    }

    public async update(id: number, fields: Partial<MatchDto>): Promise<Result<void>> {
        const match = await this.matchRepo.findById(id);
        if(match.matchId === 0)
            return Result.Failure(`Match with id ${id} doesn't exist`,ErrorType.NotFound);

        const result = await this.matchRepo.update(id,fields);
        return result? Result.Success() : Result.Failure("Couldn't update match",ErrorType.Internal);
    }

    public async delete(id: number): Promise<Result<void>> {
        const match = await this.matchRepo.findById(id);
        if(match.matchId === 0)
            return Result.Failure(`Match with id ${id} doesn't exist`,ErrorType.NotFound);

        const result = await this.matchRepo.delete(id);
        return result? Result.Success(): Result.Failure("Couldn't delete match",ErrorType.Internal);
    }
}