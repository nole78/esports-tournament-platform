import { CreateTeamDto } from '../../DTOs/teams/CreateTeamDto';
import { TeamDto } from '../../DTOs/teams/TeamDto';
import { PaginatedListDto } from '../../DTOs/PaginatedListDto';
import { Team } from '../../models/Team';
import { Result } from '../../common/Result';
import { InviteDto } from '../../DTOs/invite/InviteDto';
import { UserDto } from '../../DTOs/users/UserDto';


export interface ITeamService{
    getAll(page?: number,  limit?: number) : Promise<Result<PaginatedListDto<TeamDto>>>
    getById(id: number, gamerTag: string) : Promise<Result<TeamDto>>
    getByGamerTag(tag: string, limit: number, page: number) : Promise<Result<PaginatedListDto<TeamDto>>>
    create(dto: CreateTeamDto, gamerTag: string) : Promise<Result<TeamDto>>
    update(gamerTag: string, fields: Partial<Team>, id: number) : Promise<Result<void>>
    delete(gamerTag: string, id: number) : Promise<Result<void>>
    invite(gamerTag: string, teamId: number, gamerTagInvite: string) : Promise<Result<InviteDto>>
    inviteResponse(gamerTag: string, team_id: number, response: string) : Promise<Result<void>>
    transferCaptainship(gamerTagCaptain: string, teamId: number, reciverId : number) : Promise<Result<void>>
    leaveTeam(gamerTagInitializer: string, teamId: number, userId: number) : Promise<Result<void>>

    getTeamMembers(teamId:number) : Promise<Result<UserDto[]>>

    getInvites(gamerTag: string) : Promise<Result<InviteDto[]>>

    getAllMyTeams(gamerTag: string) : Promise<Result<TeamDto[]>>
}