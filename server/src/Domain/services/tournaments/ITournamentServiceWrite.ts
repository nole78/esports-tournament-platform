import { Tournament } from "../../models/Tournament";
import { Result } from "../../common/Result";
import { CreateTournamentDto } from "../../DTOs/tournaments/CreateTournamentDto";
import { TournamentDto } from "../../DTOs/tournaments/TorunamentDto";

export interface ITournamentServiceWrite {
  create(dto: CreateTournamentDto): Promise<Result<TournamentDto>>;
  update(id: number, fields: Partial<Tournament>): Promise<Result<void>>;
  delete(id: number): Promise<Result<void>>;
}
