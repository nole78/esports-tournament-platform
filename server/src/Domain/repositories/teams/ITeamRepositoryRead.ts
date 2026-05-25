import { Team } from "../../models/Team";

export interface ITeamRepositoryRead {
    findById(id: number): Promise<Team>
    findAll(page?: number, limit?: number): Promise<Team[]>;
    findByTeamTag(teamTag: string): Promise<Team>;
    getTotal(): Promise<number>;
    findByIds(ids: number[]) : Promise<Team[]>
}