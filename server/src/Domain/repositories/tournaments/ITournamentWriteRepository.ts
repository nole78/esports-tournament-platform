import { Tournament } from "../../models/Tournament";

export interface ITournamentWriteRepository {
  create(t: Tournament): Promise<Tournament>;
  update(id: number, fields: Partial<Tournament>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}