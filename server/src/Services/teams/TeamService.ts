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
//import { readItem } from '../../../../client/src/helpers/local_storage';
import { IUserRepository } from "../../Domain/repositories/users/IUserRepository";

export class TeamService implements ITeamService {
    public constructor(private readonly teamRepo: ITeamRepository,
                       private readonly teamMemberRepo: ITeamMemberRepository,
                       private readonly userRepo: IUserRepository,
                       private readonly logger: ILoggerService
    ){}

    async getAll(page?: number, limit?: number): Promise<PaginatedListDto<TeamDto>> {
        const items = await this.teamRepo.findAll(page, limit);
        
        return new PaginatedListDto(items, items.length, page, limit);
    }
    async getById(id: number): Promise<TeamDto[] | null> {
        return this.teamRepo.findById(id);
    }
    async getByGamerTag(tag: string) : Promise<CreateTeamDto[] | null>{
        const user = await this.userRepo.findByUsername(tag);
        if (user.id === 0)
        return null;
        //all teams
        const teams =  await this.teamRepo.findAll(1, 20);
        //for id =1 it gives 4 rows
        const members = await this.teamMemberRepo.findByUserId(user.id);
        var retTeams = [];
        var test = [];
        
         for (var i = 0; i<members.length; i++){
             for (var j = 0; j<teams.length; j++){
                 if (members.at(i)?.teamId === teams.at(j)?.teamId){
                     retTeams.push(new CreateTeamDto(teams.at(j)?.teamName, teams.at(j)?.teamTag, teams.at(j)?.teamLogotip, teams.at(j)?.teamDescription));
                 }
             }
         }
        
       if (retTeams.length === 0){
          return null;
        }
        return retTeams;
    }
    async create(dto: CreateTeamDto, gamerTag: string): Promise<CreateTeamDto | null> {
        const currentUser = await this.userRepo.findByUsername(gamerTag);
        if (currentUser.id === 0) return null;
        const created = await this.teamRepo.create(dto);
        if (created.teamId === 0) return null;

        const memberDto = new TeamMemberDto(created.teamId, currentUser.id, TeamRole.CAPTAIN);
        const member = await this.teamMemberRepo.create(memberDto);

        //Maybe add the message to logger if the member isn't created
        return new CreateTeamDto(created.teamName, created.teamTag, created.teamLogotip, created.teamDescription);
    }
    async update(id: number, fields: Partial<TeamDto>): Promise<boolean> {
        return this.teamRepo.update(id, fields);
    }
    async delete(id: number): Promise<boolean> {
        return this.teamRepo.delete(id);
    }
}