import { CreateTeamDto } from '../../DTOs/teams/CreateTeamDto';
import { TeamDto } from '../../DTOs/teams/TeamDto';
import { PaginatedListDto } from '../../DTOs/PaginatedListDto';
import { Team } from '../../models/Team';
import { ReplyTeamDto } from '../../DTOs/teams/ReplyTeamDto';

export interface ITeamService{
    getAll(page?: number,  limit?: number) : Promise<PaginatedListDto<TeamDto>>
    getById(id: number) : Promise<TeamDto[] | null>
    create(dto: CreateTeamDto, UserId: number) : Promise<TeamDto | null>
    update(id: number, fields: Partial<TeamDto>) : Promise<boolean>
    delete(id: number) : Promise<boolean>
}