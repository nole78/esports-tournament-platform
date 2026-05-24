import { Result } from "../../common/Result";
import { UserDto } from "../../DTOs/users/UserDto";
import { AddPlayersDto } from "../../DTOs/match_players/AddPlayersDto";
import { AddPlayersResponseDto } from "../../DTOs/match_players/AddPlayersResponseDto";

export interface IMatchPlayerService{
    getAllPlayers(id: number): Promise<Result<UserDto[]>>;
    setPerformanceNotes(id: number, userId: number, notes: string) : Promise<Result<void>>;
    addPlayersToMatch(id: number, dto: AddPlayersDto) :Promise<Result<AddPlayersResponseDto>>;
    removePlayerFromMatch(id: number, userId: number) : Promise<Result<void>>;    
}