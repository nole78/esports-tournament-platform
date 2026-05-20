import { Match } from "../../models/Match";

export interface IMatchRepository {
  findById(id: number): Promise<Match>;
  findAll(page?: number, limit?: number): Promise<Match[]>;
  findByTeamId(teamId: number): Promise<Match[]>;
  create(dto: Match): Promise<Match>;
  update(id: number, fields: Partial<Match>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  getTotal(): Promise<number>;
}