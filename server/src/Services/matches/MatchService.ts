import { Result } from "../../Domain/common/Result";
import { IMatchService } from "../../Domain/services/matches/IMatchService";
import { ErrorType } from '../../Domain/common/ErrorType';
import { MatchDto } from "../../Domain/DTOs/matches/MatchDto";
import { PaginatedListDto } from "../../Domain/DTOs/PaginatedListDto";
import { Match } from '../../Domain/models/Match';
import { IMatchRepository } from '../../Domain/repositories/matches/IMatchRepository';
import { ITeamRepository } from "../../Domain/repositories/teams/ITeamRepository";
import { ITournamentRepository } from "../../Domain/repositories/tournaments/ITournamentRepository";
import { MatchResultDto } from "../../Domain/DTOs/matches/MatchResultDto";
import { MatchSlot } from "../../Domain/enums/MatchSlot";
import { MatchStatus } from "../../Domain/enums/MatchStatus";

export class MatchService implements IMatchService{
    constructor(
        private readonly matchRepo: IMatchRepository,
        private readonly teamRepo: ITeamRepository,
        private readonly tournamentRepo: ITournamentRepository
    ){}

    private toMatchDto(match: Match): MatchDto{
        return  new MatchDto(match.matchId, 
            match.tournamentId, 
            match.blueTeamId,
            match.redTeamId,
            match.winnerTeamId,
            match.status,
            match.roundNumber,
            match.bracketType,
            match.blueTeamScore,
            match.redTeamScore);
    }
    
    public async getAll(page?: number, limit?: number): Promise<Result<PaginatedListDto<MatchDto>>> {
        const result = await this.matchRepo.findAll(page,limit);
        const cnt = await this.matchRepo.getTotal();
        return Result.Success(new PaginatedListDto(result.map(m => this.toMatchDto(m)),cnt,page ?? 1,limit ?? 20))
    }

    public async getById(id: number): Promise<Result<MatchDto>> {
        const result = await this.matchRepo.findById(id);
        if(result.matchId === 0)
            return Result.Failure(`Match doesn't exist`,ErrorType.NotFound);
        return Result.Success(this.toMatchDto(result));
    }

    public async getByTournamentId(tournamentId: number): Promise<Result<MatchDto[]>>{
        const tournament = await this.tournamentRepo.findById(tournamentId);
        if(tournament.tournamentId === 0)
            return Result.Failure(`Tournament doesn't exist`,ErrorType.NotFound);

        const result = await this.matchRepo.findByTournamentId(tournamentId);
        return  Result.Success(result.map(match => this.toMatchDto(match)));
    }

    public async getByTeamId(teamId: number): Promise<Result<MatchDto[]>> {
        const team = await this.teamRepo.findById(teamId);
        if(team.teamId === 0)
            return Result.Failure(`Team doesn't exist`,ErrorType.NotFound);

        const result = await this.matchRepo.findByTeamId(teamId);
        return Result.Success(result.map(match => this.toMatchDto(match)));
    }

    public async setResult(id: number, dto: MatchResultDto) : Promise<Result<void>> {
        try
        {
            if(dto.blueTeamScore === dto.redTeamScore)
                return Result.Failure("Draws are not allowed",ErrorType.Validation);

            const match = await this.matchRepo.findById(id);
            if(match.matchId === 0)
                return Result.Failure(`Match doesn't exist`, ErrorType.NotFound);

            if(match.blueTeamId === 0 || match.redTeamId === 0)
                return Result.Failure("There is no team in this match", ErrorType.Conflict);

            if(match.status === MatchStatus.COMPLETED)
                return Result.Failure("This match has been completed", ErrorType.Conflict);

            const blueTeamScore = dto.blueTeamScore;
            const redTeamScore = dto.redTeamScore;
            const winnerTeamId = blueTeamScore > redTeamScore ? match.blueTeamId : match.redTeamId;
            const loserTeamId = match.blueTeamId === winnerTeamId ? match.redTeamId : match.blueTeamId;

            // PRE VALIDATION
            if(match.winnerToMatchId !== 0) {
                const validation = await this.validateAdvance(match.winnerToMatchId, match.winnerToSlot, winnerTeamId);
                if(!validation.isSuccess)
                    return validation;
            }
            if(match.loserToMatchId !== 0) {
                const validation = await this.validateAdvance(match.loserToMatchId, match.loserToSlot, loserTeamId);
                if(!validation.isSuccess)
                    return validation;
            }

            // SAVE RESULT
            const ok = await this.matchRepo.update(id,{blueTeamScore, redTeamScore, winnerTeamId, status: MatchStatus.COMPLETED});
            if(!ok) return Result.Failure("Couldn't set match result",ErrorType.Internal);

            // ADVANCE WINNER
            if(match.winnerToMatchId !== 0)
            {
                const result = await this.advanceTeam(match.winnerToMatchId, match.winnerToSlot, winnerTeamId);
                if(!result.isSuccess)
                    return result;
            }

            // ADVANCE LOSER
            if(match.loserToMatchId !== 0)
            {
                const result = await this.advanceTeam(match.loserToMatchId, match.loserToSlot, loserTeamId);
                if(!result.isSuccess)
                    return result;
            }
            return Result.Success();
        }
        catch(err)
        {
            return Result.Failure("There was an error setting match result",ErrorType.Internal);
        }
    }

    private async validateAdvance(matchId: number, slot: MatchSlot, teamId: number): Promise<Result<void>> {
        const nextMatch = await this.matchRepo.findById(matchId);
        if(nextMatch.matchId === 0)
            return Result.Failure("There is no match to advance to", ErrorType.NotFound);

        if(nextMatch.status === MatchStatus.COMPLETED)
            return Result.Failure("Can't add team to completed match", ErrorType.Conflict);

        if(slot === MatchSlot.BLUE && nextMatch.blueTeamId !== 0 && nextMatch.blueTeamId !== teamId) {
            return Result.Failure("There is already a team in the blue slot", ErrorType.Conflict);
        }

        if(slot === MatchSlot.RED && nextMatch.redTeamId !== 0 && nextMatch.redTeamId !== teamId) {
            return Result.Failure( "There is already a team in the red slot", ErrorType.Conflict);
        }
        return Result.Success();
    }

    private async advanceTeam(matchId: number, slot: MatchSlot, teamId: number): Promise<Result<void>> {
        const nextMatch = await this.matchRepo.findById(matchId);

        if(nextMatch.matchId === 0)
            return Result.Failure("There is no match to advance to",ErrorType.NotFound);

        if(nextMatch.status === MatchStatus.COMPLETED)
            return Result.Failure("Can't add team to completed match",ErrorType.Conflict);

        if(slot === MatchSlot.BLUE && nextMatch.blueTeamId !== 0 && nextMatch.blueTeamId !== teamId)
            return Result.Failure("There is already a team in the blue slot", ErrorType.Conflict);

        if(slot === MatchSlot.RED && nextMatch.redTeamId !== 0 && nextMatch.redTeamId !== teamId) 
            return Result.Failure("There is already a team in the red slot", ErrorType.Conflict);
        
        const ok = slot === MatchSlot.BLUE ? await this.matchRepo.update(matchId, {blueTeamId: teamId})
                : await this.matchRepo.update(matchId, {redTeamId: teamId});

        if(!ok)
            return Result.Failure("Couldn't advance team", ErrorType.Internal);
        return Result.Success();
    }
}