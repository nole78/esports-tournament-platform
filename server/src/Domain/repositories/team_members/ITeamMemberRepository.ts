import { CreateTeamMemberDto } from "../../DTOs/team_members/CreateTeamMemberDto";
import { TeamMemberDto } from "../../DTOs/team_members/TeamMemberDto";
import { TeamMember } from "../../models/TeamMember";

export interface IEntityRepository {
  findById(id: number): Promise<TeamMemberDto | null>;
  findAll(page?: number, limit?: number): Promise<TeamMemberDto[]>;
  create(dto: CreateTeamMemberDto): Promise<TeamMember>;
  update(id: number, fields: Partial<TeamMember>): Promise<boolean>;
  delete(id: number): Promise<boolean>;
}