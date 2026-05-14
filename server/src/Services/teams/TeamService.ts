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
import { UserRole } from "../../Domain/enums/UserRole";

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
        const teams =  await this.teamRepo.findAll(page, limit);
        const members = await this.teamMemberRepo.findByUserId(user.id);

        const teamMap = new Map(teams.map(t => [t.teamId,t]));
        var retTeams = members.filter(m => teamMap.has(m.teamId))
                       .map(m => {
                            const t = teamMap.get(m.teamId)!;
                            return new TeamDto(t.teamId, t.teamName, t.teamTag, t.teamLogotip, t.teamDescription, m.role);
                       });

        return retTeams.length===0 ? null : new PaginatedListDto(retTeams, retTeams.length, page, limit);
    }
    async create(dto: CreateTeamDto, gamerTag: string): Promise<CreateTeamDto | null> {
        const currentUser = await this.userRepo.findByUsername(gamerTag);
        if (currentUser.id === 0) return null;
        const created = await this.teamRepo.create(dto);
        if (created.teamId === 0) return null;

        const memberDto = new TeamMemberDto(created.teamId, currentUser.id, TeamRole.CAPTAIN);
        const member = await this.teamMemberRepo.create(memberDto);
        if (!member) return null;

        return new CreateTeamDto(created.teamName, created.teamTag, created.teamLogotip, created.teamDescription);
    }
    async update(gamer_tag: string, fields: Partial<TeamDto>, id: number): Promise<boolean> {
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
        const members = await this.teamMemberRepo.create(memberDto);
        return true;
    }
}