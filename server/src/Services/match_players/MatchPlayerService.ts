import { ErrorType } from "../../Domain/common/ErrorType";
import { Result } from "../../Domain/common/Result";
import { AddPlayerErrorDto } from "../../Domain/DTOs/match_players/AddPlayerErrorDto";
import { AddPlayersDto } from "../../Domain/DTOs/match_players/AddPlayersDto";
import { AddPlayersResponseDto } from "../../Domain/DTOs/match_players/AddPlayersResponseDto";
import { MatchPlayerDto } from "../../Domain/DTOs/match_players/MatchPlayerDto";
import { UserDto } from "../../Domain/DTOs/users/UserDto";
import { MatchStatus } from "../../Domain/enums/MatchStatus";
import { MatchPlayer } from "../../Domain/models/MatchPlayer";
import { IMatchPlayerRepository } from "../../Domain/repositories/match_players/IMatchPlayerRepository";
import { IMatchRepository } from "../../Domain/repositories/matches/IMatchRepository";
import { ITeamMemberRepository } from "../../Domain/repositories/team_members/ITeamMemberRepository";
import { ITeamRepository } from "../../Domain/repositories/teams/ITeamRepository";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { IMatchPlayerService } from "../../Domain/services/match_players/IMatchPlayerService";

export class MatchPlayerService implements IMatchPlayerService{
    constructor(
        private readonly matchRepo: IMatchRepository,
        private readonly matchPlayerRepo: IMatchPlayerRepository,
        private readonly userRepo: IUserRepository,
        private readonly teamRepo: ITeamRepository,
        private readonly teamMemberRepo: ITeamMemberRepository
    ) {}

    public async getAllPlayers(id: number): Promise<Result<UserDto[]>> {
        const match = await this.matchRepo.findById(id);
        if(match.matchId === 0)
            return Result.Failure(`Match doesn't exist`,ErrorType.NotFound);
        const matchPlayers = await this.matchPlayerRepo.findByMatchId(match.matchId);

        if(matchPlayers.length === 0)
            return Result.Success<UserDto[]>([]);

        // REMOVE DUPLICATES
        const userIds = [...new Set(matchPlayers.map(mp => mp.userId))];

        const users = await this.userRepo.findByIds(userIds);
        return Result.Success(users.map(u => new UserDto(u.id)))
    }

    
    public async setPerformanceNotes(id: number, userId: number, notes: string) : Promise<Result<void>>{
        const match = await this.matchRepo.findById(id);
        if(match.matchId === 0)
            return Result.Failure(`Match doesn't exist`,ErrorType.NotFound);

        if(match.status === MatchStatus.SCHEDULED)
            return Result.Failure("Match hasn't started, can't add performance notes now", ErrorType.Conflict);

        const user = await this.userRepo.findById(userId);
        if(user.id === 0)
            return Result.Failure(`User doesn't exist`,ErrorType.NotFound);

        const matchPlayer = await this.matchPlayerRepo.findOne(userId, id)
        if(!matchPlayer)
            return Result.Failure("User isn't a player of this match",ErrorType.NotFound);

        const result = await this.matchPlayerRepo.update(matchPlayer.userId, matchPlayer.teamId, matchPlayer.matchId,{performanceNotes: notes});
        return result? Result.Success() : Result.Failure("Couldn't set players performance notes",ErrorType.Internal);
    }


    public async addPlayersToMatch(id: number, dto: AddPlayersDto) :Promise<Result<AddPlayersResponseDto>> {
        const match = await this.matchRepo.findById(id);
        if(match.matchId === 0)
            return Result.Failure(`Match doesn't exist`, ErrorType.NotFound);

        if(match.status === MatchStatus.COMPLETED)
            return Result.Failure("Match is completed, can't add players now", ErrorType.Conflict);

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
                addedPlayers.push(new MatchPlayerDto(result.userId, result.teamId, result. matchId, result.performanceNotes));
        }

        if(addedPlayers.length === 0)
            return Result.Failure("No players were added",ErrorType.Validation);

        return Result.Success(new AddPlayersResponseDto(addedPlayers,failedPlayers));
    }

    public async removePlayerFromMatch(id: number, userId: number) : Promise<Result<void>> {
        const match = await this.matchRepo.findById(id);
        if(match.matchId === 0)
            return Result.Failure("Match doesn't exist",ErrorType.NotFound);

        if(match.status === MatchStatus.COMPLETED)
            return Result.Failure("Match is completed, can't remove players now", ErrorType.Conflict);

        const user = await this.userRepo.findById(userId);
        if(user.id === 0)
            return Result.Failure("User doesn't exist",ErrorType.NotFound);

        const players = await this.matchPlayerRepo.findByMatchId(id);
        if(players.length === 0)
            return Result.Failure("There is no players for this match yet",ErrorType.Conflict);

        const player = players.find(p => p.userId === userId);
        if(!player)
             return Result.Failure("User is not a player in this match",ErrorType.NotFound);
  
        const result = await this.matchPlayerRepo.delete(player.userId, player.teamId, player.matchId);
        return result? Result.Success() : Result.Failure("Couldn't remove player from match", ErrorType.Internal);
    }
}