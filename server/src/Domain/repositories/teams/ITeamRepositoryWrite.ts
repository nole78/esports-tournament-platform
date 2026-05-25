import { CreateTeamDto } from "../../DTOs/teams/CreateTeamDto";
import { Team } from "../../models/Team";

export interface ITeamRepositoryWrite {
    create(dto: CreateTeamDto): Promise<Team>;
    update(id: number, fields: Partial<Team>): Promise<boolean>;
    delete(id: number): Promise<boolean>;
}