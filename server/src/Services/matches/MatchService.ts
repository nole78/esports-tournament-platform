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
import { UserDto } from "../../Domain/DTOs/users/UserDto";
import { IMatchPlayerRepository } from '../../Domain/repositories/match_players/IMatchPlayerRepository';
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { ITeamMemberRepository } from "../../Domain/repositories/team_members/ITeamMemberRepository";
import { MatchPlayer } from "../../Domain/models/MatchPlayer";
import { AddPlayersDto } from "../../Domain/DTOs/match_players/AddPlayersDto";
import { AddPlayersResponseDto } from "../../Domain/DTOs/match_players/AddPlayersResponseDto";
import { MatchPlayerDto } from "../../Domain/DTOs/match_players/MatchPlayerDto";
import { AddPlayerErrorDto } from "../../Domain/DTOs/match_players/AddPlayerErrorDto";

export class MatchService implements IMatchService{
    constructor(
        private readonly matchRepo: IMatchRepository,
        private readonly teamRepo: ITeamRepository,
        private readonly userRepo: IUserRepository,
        private readonly teamMemberRepo: ITeamMemberRepository,
        private readonly matchPlayerRepo: IMatchPlayerRepository,
        private readonly tournmaentRepo: ITournamentRepository
    ){}

    private toMatchDto(match: Match): MatchDto{
        return  new MatchDto(match.matchId, 
            match.tournamentId, 
            match.blueTeamId,
            match.redTeamId,
            match.winnerTeamId,
            match.status,
            match.roundNumber,
            match.blueTeamScore,
            match.redTeamScore,
            match.WinnerToMatchId,
            match.WinnerToSlot,
            match.LoserToMatchId,
            match.LoserToSlot);
    }
    
    public async getAll(page?: number, limit?: number): Promise<Result<PaginatedListDto<MatchDto>>> {
        const result = await this.matchRepo.findAll(page,limit);
        const cnt = await this.matchRepo.getTotal();
        return Result.Success(new PaginatedListDto(result.map(m => this.toMatchDto(m)),cnt,page ?? 1,limit ?? 20))
    }

    public async getAllPlayers(id: number): Promise<Result<UserDto[]>> {
        const match = await this.matchRepo.findById(id);
        if(match.matchId === 0)
            return Result.Failure(`Match doesn't exist`,ErrorType.NotFound);
        const matchPlayers = await this.matchPlayerRepo.findByMatchId(match.matchId);

        if(matchPlayers.length === 0)
            return Result.Success<UserDto[]>([]);

        let users : UserDto[] = [];
        let i = 0;
        matchPlayers.forEach(async (player) => {
            const user = await this.userRepo.findById(player.userId)
            users[i++] = user;
        });
        return Result.Success(users.map(u => new UserDto(u.id)))
    }

    public async getById(id: number): Promise<Result<MatchDto>> {
        const result = await this.matchRepo.findById(id);
        if(result.matchId === 0)
            return Result.Failure(`Match doesn't exist`,ErrorType.NotFound);
        return Result.Success(this.toMatchDto(result));
    }

    public async getByTournamentId(tournamentId: number): Promise<Result<MatchDto[]>>{
        const tournament = await this.tournmaentRepo.findById(tournamentId);
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
        const match = await this.matchRepo.findById(id);
        if(match.matchId === 0)
            return Result.Failure(`Match doesn't exist`,ErrorType.NotFound);

        const blueTeamScore = dto.blueTeamScore;
        const redTeamScore = dto.redTeamScore;
        const ok = await this.matchRepo.update(id,{blueTeamScore,redTeamScore});
        if(!ok) return Result.Failure("Couldn't set match result",ErrorType.Internal);

        return Result.Success();
    }

    public async setPerformanceNotes(id: number, userId: number, notes: string) : Promise<Result<void>>{
        const match = await this.matchRepo.findById(id);
        if(match.matchId === 0)
            return Result.Failure(`Match doesn't exist`,ErrorType.NotFound);

        const user = await this.userRepo.findById(userId);
        if(user.id === 0)
            return Result.Failure(`User doesn't exist`,ErrorType.NotFound);

        const players = await this.matchPlayerRepo.findByMatchId(id);
        const matchPlayer = players.find(mp => mp.userId == userId)
        if(!matchPlayer || matchPlayer.userId === 0)
            return Result.Failure("",ErrorType.NotFound);

        const result = await this.matchPlayerRepo.update(matchPlayer.userId, matchPlayer.teamId, matchPlayer.matchId,{performaceNotes: notes});
        return result? Result.Success() : Result.Failure("Couldn't set players performance notes",ErrorType.Internal);
    }


    public async addPlayersToMatch(id: number, dto: AddPlayersDto) :Promise<Result<AddPlayersResponseDto>> {
        const match = await this.matchRepo.findById(id);
        if(match.matchId === 0)
            return Result.Failure(`Match doesn't exist`, ErrorType.NotFound);

        const team = await this.teamRepo.findById(dto.teamId);
        if(team.teamId === 0)
            return Result.Failure("Team doesn't exist", ErrorType.NotFound);

        if(match.blueTeamId !== team.teamId && match.redTeamId !== team.teamId)
            return Result.Failure("Team is not in this match", ErrorType.Conflict);
        
        const members = await this.teamMemberRepo.findByTeamId(team.teamId);
        const players = await this.matchPlayerRepo.findByMatchId(match.matchId);

        const addedPlayers : MatchPlayerDto[] = [];
        const failedPlayers : AddPlayerErrorDto[] = [];
        const validPlayers : number[] = [];
        const uniquePlayerIds = [...new Set(dto.userIds)];
        const memberIds = new Set(members.map(m => m.userId));
        const playerIdsInMatch = new Set(players.map(p => p.userId));
        
        for(const playerId of uniquePlayerIds)
        {
            const user = await this.userRepo.findById(playerId);
            if(user.id === 0){
                failedPlayers.push(new AddPlayerErrorDto(playerId,"Player doesn't exist"));
                continue;
            }

            if(!memberIds.has(playerId)){
                failedPlayers.push(new AddPlayerErrorDto(playerId,"Player is not a member of a team"));
                continue;
            }

            if(playerIdsInMatch.has(playerId)){
                failedPlayers.push(new AddPlayerErrorDto(playerId,"Player is already in this match"));
                continue;
            }

            validPlayers.push(playerId);
        }

        for(const playerId of validPlayers)
        {
            const result = await this.matchPlayerRepo.create(new MatchPlayer(playerId, team.teamId, id));
            if(!result)
                failedPlayers.push(new AddPlayerErrorDto(playerId, "Failed to add player to match"));
            else
                addedPlayers.push(new MatchPlayerDto(result.userId, result.teamId, result. matchId, result.performaceNotes));
        }

        if(addedPlayers.length === 0)
            return Result.Failure("No players were added",ErrorType.Validation);

        return Result.Success(new AddPlayersResponseDto(addedPlayers,failedPlayers));
    }

    public async removePlayerFromMatch(id: number, userId: number) : Promise<Result<void>> {
        const match = await this.matchRepo.findById(id);
        if(match.matchId === 0)
            return Result.Failure("Match doesn't exist",ErrorType.NotFound);

        const user = await this.userRepo.findById(userId);
        if(user.id === 0)
            return Result.Failure("User doesn't exist",ErrorType.NotFound);

        const players = await this.matchPlayerRepo.findByMatchId(id);
        if(!players || players.length === 0)
            return Result.Failure("There is no players for this match yet",ErrorType.Conflict);

        const player = players.find(p => p.userId === userId);
        if(!player)
             return Result.Failure("User is not a player in any match",ErrorType.NotFound);
  
        const result = await this.matchPlayerRepo.delete(player.userId, player.teamId, player.matchId);
        return result? Result.Success() : Result.Failure("Couldn't remove player from match", ErrorType.Internal);
    }
}