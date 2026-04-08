import { TournamentRegistrationDto } from "../../DTOs/tournament_registrations/TournamentRegistrationDto";
import { TournamentRegistration } from "../../models/TournamentRegistration";
import { CreateTournamentRegistrationDto } from '../../DTOs/tournament_registrations/CreateTournamentRegistrationDto';

export interface ITournamentRegistrationRepository {
  findByTeamId(teamId: number): Promise<TournamentRegistrationDto[]>;
  findByTournamentId(tournamentId: number): Promise<TournamentRegistrationDto[]>;
  findAll(page?: number, limit?: number): Promise<TournamentRegistrationDto[]>;
  create(dto: CreateTournamentRegistrationDto): Promise<TournamentRegistration>;
  update(tournamentId: number, teamId: number, fields: Partial<TournamentRegistration>): Promise<boolean>;
  delete(tournamentId: number, teamId: number): Promise<boolean>;
}