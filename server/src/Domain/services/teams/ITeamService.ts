import { CreateTeamDto } from '../../DTOs/teams/CreateTeamDto';
import { TeamDto } from '../../DTOs/teams/TeamDto';
import { PaginatedListDto } from '../../DTOs/PaginatedListDto';
import { Team } from '../../models/Team';
import { Result } from '../../common/Result';


export interface ITeamService{
    getAll(page?: number,  limit?: number) : Promise<Result<PaginatedListDto<TeamDto>>>
    getById(id: number) : Promise<Result<TeamDto>>
    getByGamerTag(tag: string, limit: number, page: number) : Promise<Result<PaginatedListDto<TeamDto>>>
    create(dto: CreateTeamDto, gamerTag: string) : Promise<Result<CreateTeamDto>>
    update(gamer_tag: string, fields: Partial<Team>, id: number) : Promise<Result<void>>
    delete(gamer_tag: string, id: number) : Promise<Result<void>>
    addMember(gamer_tag: string, team_tag: string) : Promise<Result<void>>
}