import { TournamentRegistration } from "../../models/TournamentRegistration";

export interface ITournamentRegistrationRepositoryWrite {
  create(tr: TournamentRegistration): Promise<TournamentRegistration>;
  update(tournamentId: number, teamId: number, fields: Partial<TournamentRegistration>): Promise<boolean>;
  delete(tournamentId: number, teamId: number): Promise<boolean>;
}