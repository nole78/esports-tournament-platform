import { CreateTeamDto } from '../../DTOs/teams/CreateTeamDto';
import { TeamDto } from '../../DTOs/teams/TeamDto';
import { PaginatedListDto } from '../../DTOs/PaginatedListDto';
import { Team } from '../../models/Team';
import { Result } from '../../common/Result';
import { GuestTeamDto } from '../../DTOs/teams/GuestTeamDto';


export interface ITeamService{
    getAll(page?: number,  limit?: number) : Promise<Result<PaginatedListDto<TeamDto>>>
    getById(id: number, gamerTag: string) : Promise<Result<TeamDto>>
    getByGamerTag(tag: string, limit: number, page: number) : Promise<Result<PaginatedListDto<TeamDto>>>
    create(dto: CreateTeamDto, gamerTag: string) : Promise<Result<TeamDto>>
    update(gamerTag: string, fields: Partial<Team>, id: number) : Promise<Result<void>>
    delete(gamerTag: string, id: number) : Promise<Result<void>>
    
    getAllMyTeams(gamerTag: string) : Promise<Result<TeamDto[]>>
    
    getByIdGuest(teamId: number) : Promise<Result<GuestTeamDto>>
     
}