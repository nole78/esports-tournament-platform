import { TournamentRegistrationDto } from "../../DTOs/tournament_registrations/TournamentRegistrationDto";
import { TournamentRegistration } from "../../models/TournamentRegistration";
import { CreateTournamentRegistrationDto } from '../../DTOs/tournament_registrations/CreateTournamentRegistrationDto';

export interface IEntityRepository {
  findById(id: number): Promise<TournamentRegistrationDto | null>;
  findAll(page?: number, limit?: number): Promise<TournamentRegistrationDto[]>;
  create(dto: CreateTournamentRegistrationDto): Promise<TournamentRegistration>;
  update(id: number, fields: Partial<TournamentRegistration>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}