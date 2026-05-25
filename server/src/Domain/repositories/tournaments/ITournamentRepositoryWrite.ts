import { Tournament } from "../../models/Tournament";

export interface ITournamentRepositoryWrite {
  create(t: Tournament): Promise<Tournament>;
  update(id: number, fields: Partial<Tournament>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}