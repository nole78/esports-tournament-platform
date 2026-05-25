import { TeamMember } from "../../models/TeamMember";

export interface ITeamMemberRepositoryRead {
  findByUserId(userId: number): Promise<TeamMember[]>;
  findByTeamId(teamId: number): Promise<TeamMember[]>;
  findAll(page?: number, limit?: number): Promise<TeamMember[]>;
}