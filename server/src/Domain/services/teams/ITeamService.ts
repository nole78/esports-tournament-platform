import { CreateTeamDto } from '../../DTOs/teams/CreateTeamDto';
import { TeamDto } from '../../DTOs/teams/TeamDto';
import { PaginatedListDto } from '../../DTOs/PaginatedListDto';
import { Team } from '../../models/Team';


export interface ITeamService{
    getAll(page?: number,  limit?: number) : Promise<PaginatedListDto<TeamDto>>
    getById(id: number) : Promise<TeamDto[] | null>
    getByGamerTag(tag: string) : Promise<CreateTeamDto[] | null>
    create(dto: CreateTeamDto, gamerTag: string) : Promise<CreateTeamDto | null>
    update(id: number, fields: Partial<TeamDto>) : Promise<boolean>
    delete(id: number) : Promise<boolean>
}