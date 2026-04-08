import { CreateTeamMemberDto } from "../../DTOs/team_members/CreateTeamMemberDto";
import { TeamMemberDto } from "../../DTOs/team_members/TeamMemberDto";
import { TeamMember } from "../../models/TeamMember";

export interface ITeamMemberRepository {
  findByUserId(userId: number): Promise<TeamMemberDto[]>;
  findByTeamId(teamId: number): Promise<TeamMemberDto[]>;
  findAll(page?: number, limit?: number): Promise<TeamMemberDto[]>;
  create(dto: CreateTeamMemberDto): Promise<TeamMember>;
  update(teamId: number, userId: number, fields: Partial<TeamMember>): Promise<boolean>;
  delete(teamId: number, userId: number): Promise<boolean>;
}