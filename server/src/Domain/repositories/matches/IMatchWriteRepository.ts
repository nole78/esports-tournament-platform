import { Match } from "../../models/Match";

export interface IMatchWriteRepository {
  createBulk(matches: Match[]):Promise<Match[]>;
  update(id: number, fields: Partial<Match>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}