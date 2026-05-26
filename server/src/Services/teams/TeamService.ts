//needed dto, interfacees nad paginatedListDTO
import { CreateTeamDto } from "../../Domain/DTOs/teams/CreateTeamDto";
import { TeamDto } from "../../Domain/DTOs/teams/TeamDto";
import { PaginatedListDto } from "../../Domain/DTOs/PaginatedListDto";
import { ITeamService } from "../../Domain/services/teams/ITeamService";
import { TeamRole } from "../../Domain/enums/TeamRole";
import { IUserReadRepository } from "../../Domain/repositories/users/IUserReadRepository";
import { TeamMember } from "../../Domain/models/TeamMember";
import { Team } from '../../Domain/models/Team';
import { Result } from '../../Domain/common/Result';
import { ErrorType } from "../../Domain/common/ErrorType";
import { GuestTeamDto } from "../../Domain/DTOs/teams/GuestTeamDto";
import { ITeamRepositoryWrite } from "../../Domain/repositories/teams/ITeamRepositoryWrite";
import { ITeamRepositoryRead } from "../../Domain/repositories/teams/ITeamRepositoryRead";
import { ITeamMemberRepositoryWrite } from "../../Domain/repositories/team_members/ITeamMemberRepositoryWrite";
import { ITeamMemberRepositoryRead } from "../../Domain/repositories/team_members/ITeamMemberRepositoryRead";
import { IInvitesRepositoryWrite } from "../../Domain/repositories/invites/IInvitesRepositoryWrite";
import { IInvitesRepositoryRead } from "../../Domain/repositories/invites/IInvitesRepositoryRead";


export class TeamService implements ITeamService {
    public constructor(
                       private readonly teamRepoWrite: ITeamRepositoryWrite,
                       private readonly teamRepoRead: ITeamRepositoryRead,
                       private readonly teamMemberRepoWrite: ITeamMemberRepositoryWrite,
                       private readonly teamMemberRepoRead: ITeamMemberRepositoryRead,
                       private readonly userReadRepo: IUserReadRepository,
                       private readonly inviteRepoWrite: IInvitesRepositoryWrite,
                       private readonly inviteRepoRead: IInvitesRepositoryRead
    ){}

    private toTeamDto(team: Team) : TeamDto{
            return new TeamDto(team.teamId ,team.teamName,team.teamTag,team.teamLogotip,team.teamDescription);
        }
    async getAll(page?: number, limit?: number): Promise<Result<PaginatedListDto<TeamDto>>> {
        const items = await this.teamRepoRead.findAll(page, limit);
        const list = items.map(m => this.toTeamDto(m));
        const total = await this.teamRepoRead.getTotal();
        return Result.Success(new PaginatedListDto(list, total, page, limit));
    }
    async getById(id: number, gamerTag: string): Promise<Result<TeamDto>> {
        const team = await this.teamRepoRead.findById(id);
        if(team.teamId === 0){
            return Result.Failure(`Team with id ${id} doesn't exist`, ErrorType.NotFound);
        }
        const user = await this.userReadRepo.findByUsername(gamerTag);
        if (user.id===0){
            return Result.Failure(`User with ${gamerTag} username doesn't exist`, ErrorType.NotFound);
        }
        const members = await this.teamMemberRepoRead.findByTeamId(team.teamId);
        const isCaptain = members.some(m=>m.userId === user.id && m.role === TeamRole.CAPTAIN);
        if (isCaptain){
        const teamDto = new TeamDto(team.teamId, team.teamName, team.teamTag, team.teamLogotip, team.teamDescription, TeamRole.CAPTAIN);
        return Result.Success(teamDto);
        }else{
            const teamDto = new TeamDto(team.teamId, team.teamName, team.teamTag, team.teamLogotip, team.teamDescription);
        return Result.Success(teamDto);
        }
    }
    async getByGamerTag(tag: string, limit: number, page: number) : Promise<Result<PaginatedListDto<TeamDto>>>{

        const user = await this.userReadRepo.findByUsername(tag);
        if (user.id === 0)
            return Result.Failure(`User with ${tag} username doesn't exist`, ErrorType.NotFound);
        ;
        
        const members = await this.teamMemberRepoRead.findByUserId(user.id);
        if (members.length === 0){
            return Result.Success(new PaginatedListDto([], 0, page, limit));
        }

        const resolvedPage = page > 0 ? page : 1;
        const resolvedLimit = limit > 0 ? limit : members.length;
        const offset = (resolvedPage-1) * resolvedLimit;
        const pagedMembers = members.slice(offset, offset + resolvedLimit);

        if (pagedMembers.length === 0){
            return Result.Success(new PaginatedListDto([], members.length, resolvedPage, resolvedLimit));
        }
        
        const teams = await Promise.all(
            pagedMembers.map(member => this.teamRepoRead.findById(member.teamId))
        );
        const teamMap = new Map(teams.map(t => [t.teamId, t]));

        const retTeams = pagedMembers.filter(m => teamMap.has(m.teamId))
                         .map(m => {
                            const t = teamMap.get(m.teamId)!;
                            return new TeamDto(t.teamId, t.teamName, t.teamTag,
                                t.teamLogotip, t.teamDescription, m.role
                            );
                         });
        
        return Result.Success(new PaginatedListDto(retTeams, members.length, resolvedPage, resolvedLimit));
    }

    async create(dto: CreateTeamDto, gamerTag: string): Promise<Result<TeamDto>> {
        const currentUser = await this.userReadRepo.findByUsername(gamerTag);
        if (currentUser.id === 0) return Result.Failure(`User with ${gamerTag} username doesn't exist`, ErrorType.NotFound);
        const created = await this.teamRepoWrite.create(dto);
        if (created.teamId === 0) return Result.Failure(`Couldn't create team`, ErrorType.Internal);

        const memberDto = new TeamMember(created.teamId, currentUser.id, TeamRole.CAPTAIN);
        const member = await this.teamMemberRepoWrite.create(memberDto);
        if (member.teamId !== created.teamId || member.userId !== currentUser.id)
             return Result.Failure(`Couldn't create team members`, ErrorType.Internal);

        return Result.Success(new TeamDto(created.teamId, created.teamName, created.teamTag, created.teamLogotip, created.teamDescription));
    }
    async update(gamerTag: string, fields: Partial<Team>, id: number): Promise<Result<void>> {
        const currentUser = await this.userReadRepo.findByUsername(gamerTag);
        if (currentUser.id === 0) return Result.Failure(`User with ${gamerTag} username doesn't exist`, ErrorType.NotFound);;

        const team = await this.teamRepoRead.findById(id);
        const memebers = await this.teamMemberRepoRead.findByTeamId(team.teamId);

        const isCaptain = memebers.some(m => m.role===TeamRole.CAPTAIN && m.userId === currentUser.id);
        if (!isCaptain) return Result.Failure(`User is not authorized to update the team`, ErrorType.Unauthorized);

        const res = await this.teamRepoWrite.update(team.teamId, fields);
        return res ? Result.Success() : Result.Failure(`Couldn't updtate team`, ErrorType.Internal);
    }

    async delete(gamerTag: string, id: number): Promise<Result<void>> {
        const currentUser = await this.userReadRepo.findByUsername(gamerTag);
        
        if (currentUser.id === 0) return Result.Failure(`User with ${gamerTag} username doesn't exist`, ErrorType.NotFound);;
        const team = await this.teamRepoRead.findById(id);
        const members = await this.teamMemberRepoRead.findByTeamId(team?.teamId as number);
        
        const isCaptain = members.some(m => m.role === TeamRole.CAPTAIN && m.userId === currentUser.id);
        if (!isCaptain) return Result.Failure(`User is not authorized to delete the team`, ErrorType.Unauthorized);;

        
        const res = await this.teamRepoWrite.delete(team?.teamId as number);
        return res ? Result.Success() : Result.Failure(`Couldn't delete team`, ErrorType.Internal);
    }

    
    async getAllMyTeams(gamerTag: string): Promise<Result<TeamDto[]>> {
        const currentUser = await this.userReadRepo.findByUsername(gamerTag);
        if (currentUser.id === 0) return Result.Failure(`User with ${gamerTag} username doesn't exist`, ErrorType.NotFound);;
        
        const members = await this.teamMemberRepoRead.findByUserId(currentUser.id);
        //Gets all the member data that you are the captain of
        const membersCaptain = members.filter(m => m.role === TeamRole.CAPTAIN && m.userId === currentUser.id);

        const teams = await Promise.all(
            membersCaptain.map(m => this.teamRepoRead.findById(m.teamId))
        );

        return Result.Success(teams.map(t => new TeamDto(t.teamId, t.teamName, t.teamTag, t.teamLogotip, t.teamDescription, TeamRole.CAPTAIN)));
    }

    async getByIdGuest(teamId: number): Promise<Result<GuestTeamDto>>{
        const team = await this.teamRepoRead.findById(teamId);
        if (team.teamId === 0){
            return Result.Failure(`Team with ${teamId} doesn't exist`, ErrorType.NotFound);
        }
        return Result.Success(new GuestTeamDto(team.teamId, team.teamName, team.teamTag, team.teamLogotip, team.teamDescription));
    }
}