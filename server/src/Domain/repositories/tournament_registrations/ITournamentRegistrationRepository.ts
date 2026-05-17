import { TournamentRegistration } from "../../models/TournamentRegistration";

export interface ITournamentRegistrationRepository {
  findTotalByTeamId(teamId: number): Promise<number>;
  findTotalByTournamentId(tournamentId: number): Promise<number>;
  findByTeamId(teamId: number, page?:number, limit?:number): Promise<TournamentRegistration[]>;
  findByTournamentId(tournamentId: number, page?:number, limit?:number): Promise<TournamentRegistration[]>;
  findAll(page?: number, limit?: number): Promise<TournamentRegistration[]>;
  create(tr: TournamentRegistration): Promise<TournamentRegistration>;
  update(tournamentId: number, teamId: number, fields: Partial<TournamentRegistration>): Promise<boolean>;
  delete(tournamentId: number, teamId: number): Promise<boolean>;
}