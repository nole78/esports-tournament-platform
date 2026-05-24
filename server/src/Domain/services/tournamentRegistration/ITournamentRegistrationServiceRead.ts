import { Result } from "../../common/Result";
import { PaginatedListDto } from "../../DTOs/PaginatedListDto";
import { TournamentRegistrationDto } from "../../DTOs/tournament_registrations/TournamentRegistrationDto";
import { TournamentRegistrationStatus } from "../../enums/TournamentRegistrationStatus";

export interface ITournamentRegistrationServiceRead{
    getByTeamId(teamId: number, page?:number, limit?:number): Promise<Result<PaginatedListDto<TournamentRegistrationDto>>>;
    getByTournamentId(tournamentId: number, status?:TournamentRegistrationStatus, page?:number, limit?:number): Promise<Result<PaginatedListDto<TournamentRegistrationDto>>>;
}