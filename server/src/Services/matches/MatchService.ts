import { Result } from "../../Domain/common/Result";
import { IMatchService } from "../../Domain/services/matches/IMatchService";
import { ErrorType } from '../../Domain/common/ErrorType';
import { MatchDto } from "../../Domain/DTOs/matches/MatchDto";
import { PaginatedListDto } from "../../Domain/DTOs/PaginatedListDto";
import { MatchResultDto } from "../../Domain/DTOs/matches/MatchResultDto";
import { MatchStatus } from "../../Domain/enums/MatchStatus";
import { IMatchReadRepository } from "../../Domain/repositories/matches/IMatchReadRepository";
import { IMatchWriteRepository } from "../../Domain/repositories/matches/IMatchWriteRepository";
import { MatchDetailsDto } from "../../Domain/DTOs/matches/MatchDetailsDto";
import { IGameRepository } from "../../Domain/repositories/games/IGameRepository";
import { ITeamRepositoryRead } from "../../Domain/repositories/teams/ITeamRepositoryRead";
import { ITournamentReadRepository } from "../../Domain/repositories/tournaments/ITournamentReadRepository";
import { IBracketAdvancementService } from "../../Domain/services/bracket/IBracketAdvancmentService";
import { MatchMapper } from './helpers/MatchMapper';
import { MatchTeamHelper } from './helpers/MatchTeamHelper';

export class MatchService implements IMatchService{
    constructor(
        private readonly matchReadRepo: IMatchReadRepository,
        private readonly matchWriteRepo: IMatchWriteRepository,
        
        private readonly teamRepo: ITeamRepositoryRead,
        private readonly tournamentRepo: ITournamentReadRepository,
        private readonly gameRepo: IGameRepository,

        private readonly bracketAdvancementService: IBracketAdvancementService,
    ){}

    public async getAll(page?: number, limit?: number): Promise<Result<PaginatedListDto<MatchDto>>> {
        const matches = await this.matchReadRepo.findAll(page,limit);
        const cnt = await this.matchReadRepo.getTotal();

        const teamsMap = await MatchTeamHelper.getTeamsMap(matches,this.teamRepo);

        const dtos = matches.map(match => MatchMapper.toMatchDto(match,teamsMap))

        return Result.Success(new PaginatedListDto(dtos, cnt, page ?? 1,limit ?? 20))
    }

    public async getById(id: number): Promise<Result<MatchDetailsDto>> {
        const match = await this.matchReadRepo.findById(id);
        if(match.matchId === 0)
            return Result.Failure(`Match doesn't exist`,ErrorType.NotFound);
        
        const teamsMap = await MatchTeamHelper.getTeamsMap([match], this.teamRepo);

        const tournament = await this.tournamentRepo.findById(match.tournamentId);
        const game = await this.gameRepo.findById(tournament.tournamentGameId);

        const redTeam = teamsMap.get(match.redTeamId);
        const blueTeam = teamsMap.get(match.blueTeamId);

        return Result.Success(
            new MatchDetailsDto(
                match.matchId,

                match.status,
                match.roundNumber,

                match.blueTeamId,
                blueTeam?.teamName ?? "",
                blueTeam?.teamTag ?? "",
                blueTeam?.teamLogotip ?? "",

                match.redTeamId,
                redTeam?.teamName ?? "",
                redTeam?.teamTag ?? "",
                redTeam?.teamLogotip ?? "",

                match.winnerTeamId,

                match.blueTeamScore,
                match.redTeamScore,

                match.tournamentId,
                tournament.tournamentName,

                game.gameName,
                game.gamePlayers
            )
        );
    }

    public async getByTournamentId(tournamentId: number): Promise<Result<MatchDto[]>>{
        const tournament = await this.tournamentRepo.findById(tournamentId);
        if(tournament.tournamentId === 0)
            return Result.Failure(`Tournament doesn't exist`,ErrorType.NotFound);

        const matches = await this.matchReadRepo.findByTournamentId(tournamentId);
        
        const teamsMap = await MatchTeamHelper.getTeamsMap(matches,this.teamRepo);

        const dtos = matches.map(match => MatchMapper.toMatchDto(match,teamsMap))

        return Result.Success(dtos);
    }

    public async getByTeamId(teamId: number): Promise<Result<MatchDto[]>> {
        const team = await this.teamRepo.findById(teamId);
        if(team.teamId === 0)
            return Result.Failure(`Team doesn't exist`,ErrorType.NotFound);

        const matches = await this.matchReadRepo.findByTeamId(teamId);
        
        const teamsMap = await MatchTeamHelper.getTeamsMap(matches,this.teamRepo);

        const dtos = matches.map(match => MatchMapper.toMatchDto(match,teamsMap))

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
                const validation = await this.bracketAdvancementService.validateAdvance(match.winnerToMatchId, match.winnerToSlot, winnerTeamId);
                if(!validation.isSuccess)
                    return validation;
            }
            if(match.loserToMatchId) {
                const validation = await this.bracketAdvancementService.validateAdvance(match.loserToMatchId, match.loserToSlot, loserTeamId);
                if(!validation.isSuccess)
                    return validation;
            }
            // SAVE RESULT
            const ok = await this.matchWriteRepo.update(id,{blueTeamScore, redTeamScore, winnerTeamId, status: MatchStatus.COMPLETED});
            if(!ok) return Result.Failure("Couldn't set match result",ErrorType.Internal);
            // ADVANCE WINNER
            if(match.winnerToMatchId) {
                const result = await this.bracketAdvancementService.advanceTeam(match.winnerToMatchId, match.winnerToSlot, winnerTeamId);
                if(!result.isSuccess)
                    return result;
            }
            // ADVANCE LOSER
            if(match.loserToMatchId) {
                const result = await this.bracketAdvancementService.advanceTeam(match.loserToMatchId, match.loserToSlot, loserTeamId);
                if(!result.isSuccess)
                    return result;
            }
            return Result.Success();
        }
        catch(err) {
            return Result.Failure("There was an error setting match result",ErrorType.Internal);
        }
    }
}