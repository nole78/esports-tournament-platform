import { Match } from "../../models/Match";
import { MatchRelationUpdate } from "../../types/MatchRelationUpdate";

export interface IMatchWriteRepository {
  create(dto: Match): Promise<Match>;
  createBulk(matches: Match[]):Promise<Match[]>;
  update(id: number, fields: Partial<Match>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}