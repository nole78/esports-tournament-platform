import { Team } from "../../models/Team"
import { TeamDto } from "../../DTOs/teams/TeamDto";
import { CreateTeamDto} from "../../DTOs/teams/CreateTeamDto";

export interface ITeamRepository {
    findById(id: number): Promise<Team>
    findAll(page?: number, limit?: number): Promise<Team[]>;
    create(dto: CreateTeamDto): Promise<Team>;
    update(id: number, fields: Partial<Team>): Promise<boolean>;
    delete(id: number): Promise<boolean>;
    findByTeamTag(teamTag: string): Promise<Team>;
    getTotal(): Promise<number>;
}