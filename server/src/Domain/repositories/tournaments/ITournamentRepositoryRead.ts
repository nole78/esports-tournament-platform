import { Tournament } from "../../models/Tournament";

export interface ITournamentRepositoryRead {
  findTotal(): Promise<number>;
  findTotalFiltered(tournamentGameId?:number, tournamentFormat?:string, tournamentStatus?:string): Promise<number>;
  findById(id: number): Promise<Tournament>;
  findAll(page?: number, limit?: number): Promise<Tournament[]>;
  findFiltered(tournamentGameId?:number, tournamentFormat?:string, tournamentStatus?:string, page?:number, limit?: number): Promise<Tournament[]>;
}