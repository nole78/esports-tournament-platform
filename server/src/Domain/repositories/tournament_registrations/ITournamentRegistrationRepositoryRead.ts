import { TournamentRegistrationStatus } from "../../enums/TournamentRegistrationStatus";
import { TournamentRegistration } from "../../models/TournamentRegistration";

export interface ITournamentRegistrationRepositoryRead{
    findTotalByTeamId(teamId: number): Promise<number>;
    findTotalByTournamentId(tournamentId: number, status?:TournamentRegistrationStatus): Promise<number>;
    findByTeamId(teamId: number, page?:number, limit?:number): Promise<TournamentRegistration[]>;
    findByTournamentId(tournamentId: number, status?:TournamentRegistrationStatus, page?:number, limit?:number): Promise<TournamentRegistration[]>;
    findByTournamentAndTeamId(tournamentId: number, teamId: number): Promise<TournamentRegistration>;
    findAll(page?: number, limit?: number): Promise<TournamentRegistration[]>;
}