import { Team } from "../../models/Team"
import { TeamDto } from "../../DTOs/teams/TeamDto";
import { CreateTeamDto} from "../../DTOs/teams/CreateTeamDto";

export interface ITeamRepository {
    findById(id: number): Promise<TeamDto[] | null>
    findAll(page?: number, limit?: number): Promise<TeamDto[]>;
    //findByUserTag(tag: string): Promise<TeamDto[] | null>;
    create(dto: CreateTeamDto): Promise<Team>;
    update(id: number, fields: Partial<Team>): Promise<boolean>;
    delete(id: number): Promise<boolean>;
}