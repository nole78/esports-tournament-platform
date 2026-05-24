import { Tournament } from "../../models/Tournament";

export interface ITournamentRepository {
  findTotal(): Promise<number>;
  findTotalFiltered(tournamentGameId?:number, tournamentFormat?:string, tournamentStatus?:string): Promise<number>;
  findById(id: number): Promise<Tournament>;
  findAll(page?: number, limit?: number): Promise<Tournament[]>;
  findFiltered(tournamentGameId?:number, tournamentFormat?:string, tournamentStatus?:string, page?:number, limit?: number): Promise<Tournament[]>;
  create(t: Tournament): Promise<Tournament>;
  update(id: number, fields: Partial<Tournament>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}