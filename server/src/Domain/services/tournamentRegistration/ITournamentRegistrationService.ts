import { PaginatedListDto } from "../../DTOs/PaginatedListDto";
import { CreateTournamentRegistrationDto } from "../../DTOs/tournament_registrations/CreateTournamentRegistrationDto";
import { TournamentRegistrationDto } from "../../DTOs/tournament_registrations/TournamentRegistrationDto";
import { Result } from '../../common/Result';

export interface ITournamentRegistrationService{
    getByTeamId(teamId: number, page?:number, limit?:number): Promise<Result<PaginatedListDto<TournamentRegistrationDto>>>;
    getByTournamentId(tournamentId: number, page?:number, limit?:number): Promise<Result<PaginatedListDto<TournamentRegistrationDto>>>;
    create(tr: CreateTournamentRegistrationDto): Promise<Result<TournamentRegistrationDto>>;
    update(tournamentId: number, teamId: number, fields: Partial<TournamentRegistrationDto>): Promise<Result<void>>;
    delete(tournamentId: number, teamId: number): Promise<Result<void>>;
}