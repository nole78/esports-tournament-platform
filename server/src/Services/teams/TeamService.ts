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

export class TeamService implements ITeamService {
    public constructor(private readonly teamRepo: ITeamRepository,
                       private readonly teamMemberRepo: ITeamMemberRepository,
                       private readonly logger: ILoggerService
    ){}

    async getAll(page?: number, limit?: number): Promise<PaginatedListDto<TeamDto>> {
        const items = await this.teamRepo.findAll(page, limit);
        return new PaginatedListDto(items, items.length, page, limit);
    }
    async getById(id: number): Promise<TeamDto | null> {
        return this.teamRepo.findById(id);
    }
    async create(dto: CreateTeamDto, userId:number): Promise<TeamDto | null> {
        const created = await this.teamRepo.create(dto);
        if (created.teamId === 0) return null;

        const memberDto = new TeamMemberDto(created.teamId, userId, TeamRole.CAPTAIN);
        const member = await this.teamMemberRepo.create(memberDto);

        //Maybe add the message to logger if the member isn't created
        return new TeamDto(created.teamId, created.teamName, created.teamTag, created.teamLogotip, created.teamDescription);
    }
    async update(id: number, fields: Partial<TeamDto>): Promise<boolean> {
        return this.teamRepo.update(id, fields);
    }
    async delete(id: number): Promise<boolean> {
        return this.teamRepo.delete(id);
    }
}