import { CreateTournamentRegistrationDto } from "../../DTOs/tournament_registrations/CreateTournamentRegistrationDto";
import { TournamentRegistrationDto } from "../../DTOs/tournament_registrations/TournamentRegistrationDto";
import { Result } from '../../common/Result';

export interface ITournamentRegistrationWriteService{
    create(tr: CreateTournamentRegistrationDto): Promise<Result<TournamentRegistrationDto>>;
    update(tournamentId: number, teamId: number, fields: Partial<TournamentRegistrationDto>): Promise<Result<void>>;
    delete(tournamentId: number, teamId: number): Promise<Result<void>>;
    generateBracket(id: number): Promise<Result<void>>;
}