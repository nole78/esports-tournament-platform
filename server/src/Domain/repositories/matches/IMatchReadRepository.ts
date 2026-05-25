import { Match } from "../../models/Match";

export interface IMatchReadRepository {
      findById(id: number): Promise<Match>;
      findAll(page?: number, limit?: number): Promise<Match[]>;
      findByTeamId(teamId: number): Promise<Match[]>;
      findByTournamentId(teamId: number): Promise<Match[]>;
      getTotal(): Promise<number>;
}