//needed dto, interfacees nad paginatedListDTO
import { CreateTeamDto } from "../../Domain/DTOs/teams/CreateTeamDto";
import { TeamDto } from "../../Domain/DTOs/teams/TeamDto";
import { PaginatedListDto } from "../../Domain/DTOs/PaginatedListDto";
import { ITeamRepository } from "../../Domain/repositories/teams/ITeamRepository";
import { ITeamService } from "../../Domain/services/teams/ITeamService";
import { ITeamMemberRepository } from "../../Domain/repositories/team_members/ITeamMemberRepository";
import { TeamMemberDto } from "../../Domain/DTOs/team_members/TeamMemberDto";
import { TeamRole } from "../../Domain/enums/TeamRole";
import { ILoggerService } from "../../Domain/services/logger/ILoggerService";
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";
import { TeamMember } from "../../Domain/models/TeamMember";
import { Team } from "../../Domain/models/Team";


export class TeamService implements ITeamService {
    public constructor(private readonly teamRepo: ITeamRepository,
                       private readonly teamMemberRepo: ITeamMemberRepository,
                       private readonly userRepo: IUserRepository,
                       private readonly logger: ILoggerService
    ){}

    async getAll(page?: number, limit?: number): Promise<PaginatedListDto<TeamDto>> {
        const items = await this.teamRepo.findAll(page, limit);
        
        const total = await this.teamRepo.getTotal();
        return new PaginatedListDto(items, total, page, limit);
    }
    async getById(id: number): Promise<TeamDto> {
        const team = await this.teamRepo.findById(id);
        return team;
    }
    async getByGamerTag(tag: string, limit: number, page: number) : Promise<PaginatedListDto<TeamDto> | null>{

        const user = await this.userRepo.findByUsername(tag);
        if (user.id === 0)
            return null;
        
        const members = await this.teamMemberRepo.findByUserId(user.id);
        if (members.length === 0){
            return new PaginatedListDto([], 0, page, limit);
        }

        const resolvedPage = page > 0 ? page : 1;
        const resolvedLimit = limit > 0 ? limit : members.length;
        const offset = (resolvedPage-1) * resolvedLimit;
        const pagedMembers = members.slice(offset, offset + resolvedLimit);

        if (pagedMembers.length === 0){
            return new PaginatedListDto([], members.length, resolvedPage, resolvedLimit);
        }
        
        const teams = await Promise.all(
            pagedMembers.map(member => this.teamRepo.findById(member.teamId))
        );
        const teamMap = new Map(teams.map(t => [t.teamId, t]));

        const retTeams = pagedMembers.filter(m => teamMap.has(m.teamId))
                         .map(m => {
                            const t = teamMap.get(m.teamId)!;
                            return new TeamDto(t.teamId, t.teamName, t.teamTag,
                                t.teamLogotip, t.teamDescription, m.role
                            );
                         });
        
        return new PaginatedListDto(retTeams, members.length, resolvedPage, resolvedLimit);
    }
    async create(dto: CreateTeamDto, gamerTag: string): Promise<CreateTeamDto | null> {
        const currentUser = await this.userRepo.findByUsername(gamerTag);
        if (currentUser.id === 0) return null;
        const created = await this.teamRepo.create(dto);
        if (created.teamId === 0) return null;

        const memberDto = new TeamMember(created.teamId, currentUser.id, TeamRole.CAPTAIN);
        const member = await this.teamMemberRepo.create(memberDto);
        if (member.teamId !== created.teamId || member.userId !== currentUser.id)
             return null;

        return new CreateTeamDto(created.teamName, created.teamTag, created.teamLogotip, created.teamDescription);
    }
    async update(gamer_tag: string, fields: Partial<Team>, id: number): Promise<boolean> {
        const currentUser = await this.userRepo.findByUsername(gamer_tag);
        if (currentUser.id === 0) return false;

        const team = await this.teamRepo.findById(id);
        const memebers = await this.teamMemberRepo.findByTeamId(team.teamId);

        const isCaptain = memebers.some(m => m.role===TeamRole.CAPTAIN && m.userId === currentUser.id);
        if (!isCaptain) return false;
        return this.teamRepo.update(team.teamId, fields);

    }
    async delete(gamer_tag: string, id: number): Promise<boolean> {
        const currentUser = await this.userRepo.findByUsername(gamer_tag);
        
        if (currentUser.id === 0) return false;
        const team = await this.teamRepo.findById(id);
        const members = await this.teamMemberRepo.findByTeamId(team?.teamId as number);
        
        const memberMap = members.map(t => [t.teamId, t]);
        const isCaptain = members.some(m => m.role === TeamRole.CAPTAIN && m.userId === currentUser.id);
        if (!isCaptain) return false;

        await Promise.all(members.map(m =>
            this.teamMemberRepo.delete(team?.teamId, m.userId)
        ));
        
        return await this.teamRepo.delete(team?.teamId as number);
    }
    async addMember(gamer_tag: string, team_tag: string): Promise<boolean> {

        const currentUser = await this.userRepo.findByUsername(gamer_tag);
        if (currentUser.id === 0) return false;

        const team = await this.teamRepo.findByTeamTag(team_tag);
        if (!team || team?.teamId as number === 0) return false;

        const memberDto = new TeamMemberDto(team?.teamId as number, currentUser.id, TeamRole.MEMBER);
        const member = await this.teamMemberRepo.create(memberDto);
        return !!member && member.userId === memberDto.userId && member.teamId === memberDto.teamId
        && member.role === memberDto.role ;
    }
}