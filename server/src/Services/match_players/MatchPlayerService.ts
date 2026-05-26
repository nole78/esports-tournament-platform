import { ErrorType } from "../../Domain/common/ErrorType";
import { Result } from "../../Domain/common/Result";
import { AddPlayerErrorDto } from "../../Domain/DTOs/match_players/AddPlayerErrorDto";
import { AddPlayersDto } from "../../Domain/DTOs/match_players/AddPlayersDto";
import { AddPlayersResponseDto } from "../../Domain/DTOs/match_players/AddPlayersResponseDto";
import { MatchPlayerDto } from "../../Domain/DTOs/match_players/MatchPlayerDto";
import { MatchStatus } from "../../Domain/enums/MatchStatus";
import { MatchPlayer } from "../../Domain/models/MatchPlayer";
import { IMatchPlayerReadRepository } from "../../Domain/repositories/match_players/IMatchPlayerReadRepository";
import { IMatchPlayerWriteRepository } from "../../Domain/repositories/match_players/IMatchPlayerWriteRepository";
import { IUserReadRepository } from "../../Domain/repositories/users/IUserReadRepository";
import { IMatchPlayerService } from "../../Domain/services/match_players/IMatchPlayerService";
import { TeamRole } from "../../Domain/enums/TeamRole";
import { IMatchReadRepository } from "../../Domain/repositories/matches/IMatchReadRepository";
import { ITeamRepositoryRead } from "../../Domain/repositories/teams/ITeamRepositoryRead";
import { ITeamMemberRepositoryRead } from '../../Domain/repositories/team_members/ITeamMemberRepositoryRead';

export class MatchPlayerService implements IMatchPlayerService{
    constructor(
        private readonly matchReadRepository: IMatchReadRepository,
        private readonly matchPlayerReadRepo: IMatchPlayerReadRepository,
        private readonly matchPlayerWriteRepo: IMatchPlayerWriteRepository,
        private readonly userReadRepo: IUserReadRepository,
        private readonly teamRepo: ITeamRepositoryRead,
        private readonly teamMemberRepo: ITeamMemberRepositoryRead
    ) {}

    public async getMatchPlayers(id: number, teamId: number): Promise<Result<MatchPlayerDto[]>> {
        const match = await this.matchReadRepository.findById(id);
        if(match.matchId === 0)
            return Result.Failure("Match doesn't exist",ErrorType.NotFound);

        const team = await this.teamRepo.findById(teamId);
        if(team.teamId === 0)
            return Result.Failure("Team doesn't exist", ErrorType.NotFound);

        if(match.blueTeamId !== team.teamId && match.redTeamId !== team.teamId)
            return Result.Failure("Team is not in this match", ErrorType.Conflict);

        const matchPlayers = await this.matchPlayerReadRepo.findByMatchId(match.matchId);
        const teamPlayers = matchPlayers.filter((mp) => mp.teamId === teamId);
        if(teamPlayers.length === 0)
            return Result.Success([]);

        const userIds = [...new Set(teamPlayers.map((mp) => mp.userId))];
        const users = await this.userReadRepo.findByIds(userIds);
        const userMap = new Map(users.map((u) => [u.id, u.gamerTag]));

        return Result.Success(
            teamPlayers.map(
                (mp) =>
                    new MatchPlayerDto(
                        userMap.get(mp.userId) ?? "player",
                        mp.userId,
                        mp.teamId,
                        mp.matchId,
                        mp.performanceNotes,
                    ),
            ),
        );
    }

    
    public async setPerformanceNotes(id: number, userId: number, actorUserId: number, notes: string) : Promise<Result<void>>{
        const match = await this.matchReadRepository.findById(id);
        if(match.matchId === 0)
            return Result.Failure("Match doesn't exist",ErrorType.NotFound);

        if(match.status === MatchStatus.SCHEDULED)
            return Result.Failure("Match hasn't started, can't add performance notes now", ErrorType.Conflict);

        const user = await this.userReadRepo.findById(userId);
        if(user.id === 0)
            return Result.Failure(`User doesn't exist`,ErrorType.NotFound);

        const matchPlayer = await this.matchPlayerReadRepo.findOne(userId, id)
        if(!matchPlayer)
            return Result.Failure("User isn't a player of this match",ErrorType.NotFound);

        const members = await this.teamMemberRepo.findByTeamId(matchPlayer.teamId);
        const actorIsCaptain = members.some(m => m.userId === actorUserId && m.role === TeamRole.CAPTAIN);
        if (!actorIsCaptain) {
            return Result.Failure("Only team captain can change performance notes", ErrorType.Unauthorized);
        }

        const result = await this.matchPlayerWriteRepo.update(matchPlayer.userId, matchPlayer.teamId, matchPlayer.matchId,{performanceNotes: notes});
        return result? Result.Success() : Result.Failure("Couldn't set players performance notes",ErrorType.Internal);
    }


    public async addPlayersToMatch(id: number, dto: AddPlayersDto) :Promise<Result<AddPlayersResponseDto>> {
        const match = await this.matchReadRepository.findById(id);
        if(match.matchId === 0)
            return Result.Failure("Match doesn't exist",ErrorType.NotFound);

        if(match.status === MatchStatus.COMPLETED)
            return Result.Failure("Match is completed, can't add players now", ErrorType.Conflict);

        const team = await this.teamRepo.findById(dto.teamId);
        if(team.teamId === 0)
            return Result.Failure("Team doesn't exist", ErrorType.NotFound);

        if(match.blueTeamId !== team.teamId && match.redTeamId !== team.teamId)
            return Result.Failure("Team is not in this match", ErrorType.Conflict);
        
        const members = await this.teamMemberRepo.findByTeamId(team.teamId);
        const players = await this.matchPlayerReadRepo.findByMatchId(match.matchId);

        const addedPlayers : MatchPlayerDto[] = [];
        const failedPlayers : AddPlayerErrorDto[] = [];
        const validPlayers : number[] = [];
        const uniquePlayerIds = [...new Set(dto.userIds)];
        const memberIds = new Set(members.map(m => m.userId));
        const playerIdsInMatch = new Set(players.map(p => p.userId));
        const users = await this.userReadRepo.findByIds(uniquePlayerIds);
        const usersMap = new Map(users.map(u => [u.id, u.gamerTag]));
        
        for(const playerId of uniquePlayerIds)
        {
            const user = usersMap.get(playerId);
            if(!user){
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
            const result = await this.matchPlayerWriteRepo.create(new MatchPlayer(playerId, team.teamId, id));
            if(!result)
                failedPlayers.push(new AddPlayerErrorDto(playerId, "Failed to add player to match"));
            else
                addedPlayers.push(new MatchPlayerDto(usersMap.get(playerId) ?? "Player", result.userId, result.teamId, result. matchId, result.performanceNotes));
        }

        if(addedPlayers.length === 0)
            return Result.Failure("No players were added",ErrorType.Validation);

        return Result.Success(new AddPlayersResponseDto(addedPlayers,failedPlayers));
    }

    public async removePlayerFromMatch(id: number, userId: number) : Promise<Result<void>> {
        const match = await this.matchReadRepository.findById(id);
        if(match.matchId === 0)
            return Result.Failure("Match doesn't exist",ErrorType.NotFound);

        if(match.status === MatchStatus.COMPLETED)
            return Result.Failure("Match is completed, can't remove players now", ErrorType.Conflict);

        const user = await this.userReadRepo.findById(userId);
        if(user.id === 0)
            return Result.Failure("User doesn't exist",ErrorType.NotFound);

        const players = await this.matchPlayerReadRepo.findByMatchId(id);
        if(players.length === 0)
            return Result.Failure("There is no players for this match yet",ErrorType.Conflict);

        const player = players.find(p => p.userId === userId);
        if(!player)
             return Result.Failure("User is not a player in this match",ErrorType.NotFound);
  
        const result = await this.matchPlayerWriteRepo.delete(player.userId, player.teamId, player.matchId);
        return result? Result.Success() : Result.Failure("Couldn't remove player from match", ErrorType.Internal);
    }
}