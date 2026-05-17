import { PaginatedListDto } from "../../DTOs/PaginatedListDto";
import { CreateTournamentRegistrationDto } from "../../DTOs/tournament_registrations/CreateTournamentRegistrationDto";
import { TournamentRegistrationDto } from "../../DTOs/tournament_registrations/TournamentRegistrationDto";

export interface ITournamentRegistrationService{
    getByTeamId(teamId: number, page?:number, limit?:number): Promise<PaginatedListDto<TournamentRegistrationDto>>;
    getByTournamentId(tournamentId: number, page?:number, limit?:number): Promise<PaginatedListDto<TournamentRegistrationDto>>;
    create(tr: CreateTournamentRegistrationDto): Promise<TournamentRegistrationDto | null>;
    update(tournamentId: number, teamId: number, fields: Partial<TournamentRegistrationDto>): Promise<boolean>;
    delete(tournamentId: number, teamId: number): Promise<boolean>;
}