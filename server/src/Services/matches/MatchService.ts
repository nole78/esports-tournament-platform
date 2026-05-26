import { Result } from "../../Domain/common/Result";
import { IMatchService } from "../../Domain/services/matches/IMatchService";
import { ErrorType } from '../../Domain/common/ErrorType';
import { MatchDto } from "../../Domain/DTOs/matches/MatchDto";
import { PaginatedListDto } from "../../Domain/DTOs/PaginatedListDto";
import { Match } from '../../Domain/models/Match';
import { MatchResultDto } from "../../Domain/DTOs/matches/MatchResultDto";
import { MatchSlot } from "../../Domain/enums/MatchSlot";
import { MatchStatus } from "../../Domain/enums/MatchStatus";
import { IMatchReadRepository } from "../../Domain/repositories/matches/IMatchReadRepository";
import { IMatchWriteRepository } from "../../Domain/repositories/matches/IMatchWriteRepository";
import { MatchDetailsDto } from "../../Domain/DTOs/matches/MatchDetailsDto";
import { IGameRepository } from "../../Domain/repositories/games/IGameRepository";
import { ITeamRepositoryRead } from "../../Domain/repositories/teams/ITeamRepositoryRead";
import { ITournamentReadRepository } from "../../Domain/repositories/tournaments/ITournamentReadRepository";

// TODO: fix N+1 problem for geting team names
export class MatchService implements IMatchService{
    constructor(
        private readonly matchReadRepo: IMatchReadRepository,
        private readonly matchWriteRepo: IMatchWriteRepository,
        private readonly teamRepo: ITeamRepositoryRead,
        private readonly tournamentReadRepo: ITournamentReadRepository,
        private readonly gameRepo: IGameRepository
    ){}

    private toMatchDto(match: Match,redTeamName: string, blueTeamName: string): MatchDto{
        return  new MatchDto(match.matchId, 
            match.tournamentId, 
            match.blueTeamId,
            blueTeamName,
            match.redTeamId,
            redTeamName,
            match.winnerTeamId,
            match.status,
            match.roundNumber,
            match.bracketType,
            match.blueTeamScore,
            match.redTeamScore);
    }

    private async getTeamName(match: Match) : Promise<{redTeamName: string, redTeamTag: string, redLogo: string,
                                                        blueTeamName: string, blueTeamTag: string, blueLogo: string}> {
        let redTeamName = "";
        let redTeamTag = "";
        let redLogo = "";
        let blueTeamName = "";
        let blueTeamTag = "";
        let blueLogo = "";
        if(match.redTeamId !== 0) {
            const redTeam = await this.teamRepo.findById(match.redTeamId);
            redTeamName = redTeam.teamName;
            redTeamTag = redTeam.teamTag;
            redLogo = redTeam.teamLogotip;
        }
        if(match.blueTeamId !== 0){
            const blueTeam = await this.teamRepo.findById(match.blueTeamId);
            blueTeamName = blueTeam.teamName;
            blueTeamTag = blueTeam.teamTag;
            blueLogo = "";
        }
        
        return {redTeamName, redTeamTag, redLogo, blueTeamName, blueTeamTag, blueLogo};
    }
    
    public async getAll(page?: number, limit?: number): Promise<Result<PaginatedListDto<MatchDto>>> {
        const result = await this.matchReadRepo.findAll(page,limit);
        const cnt = await this.matchReadRepo.getTotal();

        const dtos = await Promise.all(
            result.map(async (m) => {
                const res = await this.getTeamName(m);
                return this.toMatchDto(m, res.redTeamName, res.blueTeamName);
            })
        );

        return Result.Success(new PaginatedListDto(dtos, cnt, page ?? 1,limit ?? 20))
    }

    public async getById(id: number): Promise<Result<MatchDetailsDto>> {
        const match = await this.matchReadRepo.findById(id);
        if(match.matchId === 0)
            return Result.Failure(`Match doesn't exist`,ErrorType.NotFound);
        
        const result = await this.getTeamName(match);

        const tournament = await this.tournamentReadRepo.findById(match.tournamentId);
        const game = await this.gameRepo.findById(tournament.tournamentGameId);

        return Result.Success(new MatchDetailsDto(match.matchId,match.status,match.roundNumber,match.blueTeamId,
            result.blueTeamName, result.blueTeamTag, result.blueLogo, match.redTeamId, result.redTeamName, result.redTeamTag,
            result.redLogo, match.winnerTeamId, match.blueTeamScore, match.redTeamScore, match.tournamentId, 
            tournament.tournamentName, game.gameName, game.gamePlayers
        ));
    }

    public async getByTournamentId(tournamentId: number): Promise<Result<MatchDto[]>>{
        const tournament = await this.tournamentReadRepo.findById(tournamentId);
        if(tournament.tournamentId === 0)
            return Result.Failure(`Tournament doesn't exist`,ErrorType.NotFound);

        const matches = await this.matchReadRepo.findByTournamentId(tournamentId);
        
        const dtos = await Promise.all(
            matches.map(async (match) => {
                const res = await this.getTeamName(match);
                return this.toMatchDto(match, res.redTeamName, res.blueTeamName);
            })
        );
        return  Result.Success(dtos);
    }

    public async getByTeamId(teamId: number): Promise<Result<MatchDto[]>> {
        const team = await this.teamRepo.findById(teamId);
        if(team.teamId === 0)
            return Result.Failure(`Team doesn't exist`,ErrorType.NotFound);

        const matches = await this.matchReadRepo.findByTeamId(teamId);
        
        const dtos = await Promise.all(
            matches.map(async (match) => {
                const res = await this.getTeamName(match);
                return this.toMatchDto(match, res.redTeamName, res.blueTeamName);
            })
        );

        return Result.Success(dtos);
    }

    public async setResult(id: number, dto: MatchResultDto) : Promise<Result<void>> {
        try
        {
            if(dto.blueTeamScore === dto.redTeamScore)
                return Result.Failure("Draws are not allowed",ErrorType.Validation);

            const match = await this.matchReadRepo.findById(id);
            if(match.matchId === 0)
                return Result.Failure(`Match doesn't exist`, ErrorType.NotFound);
            console.log(match);

            if(match.blueTeamId === 0 || match.redTeamId === 0)
                return Result.Failure("There is no team in this match", ErrorType.Conflict);

            if(match.status === MatchStatus.COMPLETED)
                return Result.Failure("This match has been completed", ErrorType.Conflict);

            const blueTeamScore = dto.blueTeamScore;
            const redTeamScore = dto.redTeamScore;
            const winnerTeamId = blueTeamScore > redTeamScore ? match.blueTeamId : match.redTeamId;
            const loserTeamId = match.blueTeamId === winnerTeamId ? match.redTeamId : match.blueTeamId;

            // PRE VALIDATION
            if(match.winnerToMatchId) {
                const validation = await this.validateAdvance(match.winnerToMatchId, match.winnerToSlot, winnerTeamId);
                if(!validation.isSuccess)
                    return validation;
            }
            if(match.loserToMatchId) {
                const validation = await this.validateAdvance(match.loserToMatchId, match.loserToSlot, loserTeamId);
                if(!validation.isSuccess)
                    return validation;
            }
            // SAVE RESULT
            const ok = await this.matchWriteRepo.update(id,{blueTeamScore, redTeamScore, winnerTeamId, status: MatchStatus.COMPLETED});
            if(!ok) return Result.Failure("Couldn't set match result",ErrorType.Internal);
            // ADVANCE WINNER
            if(match.winnerToMatchId) {
                const result = await this.advanceTeam(match.winnerToMatchId, match.winnerToSlot, winnerTeamId);
                if(!result.isSuccess)
                    return result;
            }
            // ADVANCE LOSER
            if(match.loserToMatchId) {
                const result = await this.advanceTeam(match.loserToMatchId, match.loserToSlot, loserTeamId);
                if(!result.isSuccess)
                    return result;
            }
            return Result.Success();
        }
        catch(err) {
            return Result.Failure("There was an error setting match result",ErrorType.Internal);
        }
    }

    private async validateAdvance(matchId: number, slot: MatchSlot, teamId: number): Promise<Result<void>> {
        const nextMatch = await this.matchReadRepo.findById(matchId);
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
        const nextMatch = await this.matchReadRepo.findById(matchId);

        if(nextMatch.matchId === 0)
            return Result.Failure("There is no match to advance to",ErrorType.NotFound);

        if(nextMatch.status === MatchStatus.COMPLETED)
            return Result.Failure("Can't add team to completed match",ErrorType.Conflict);

        if(slot === MatchSlot.BLUE && nextMatch.blueTeamId !== 0 && nextMatch.blueTeamId !== teamId)
            return Result.Failure("There is already a team in the blue slot", ErrorType.Conflict);

        if(slot === MatchSlot.RED && nextMatch.redTeamId !== 0 && nextMatch.redTeamId !== teamId) 
            return Result.Failure("There is already a team in the red slot", ErrorType.Conflict);
        
        const ok = slot === MatchSlot.BLUE ? await this.matchWriteRepo.update(matchId, {blueTeamId: teamId})
                : await this.matchWriteRepo.update(matchId, {redTeamId: teamId});

        if(!ok)
            return Result.Failure("Couldn't advance team", ErrorType.Internal);
        return Result.Success();
    }
}