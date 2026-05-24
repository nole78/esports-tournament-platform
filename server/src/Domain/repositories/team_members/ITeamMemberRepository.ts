import { CreateTeamMemberDto } from "../../DTOs/team_members/CreateTeamMemberDto";
import { TeamMemberDto } from "../../DTOs/team_members/TeamMemberDto";
import { TeamRole } from "../../enums/TeamRole";
import { TeamMember } from "../../models/TeamMember";

export interface ITeamMemberRepository {
  findByUserId(userId: number): Promise<TeamMember[]>;
  findByTeamId(teamId: number): Promise<TeamMember[]>;
  findAll(page?: number, limit?: number): Promise<TeamMember[]>;
  create(dto: TeamMemberDto): Promise<TeamMember>;
  update(teamId: number, userId: number, role: TeamRole): Promise<boolean>;
  delete(teamId: number, userId: number): Promise<boolean>;
}