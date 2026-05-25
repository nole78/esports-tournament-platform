import { TeamMemberDto } from "../../DTOs/team_members/TeamMemberDto";
import { TeamRole } from "../../enums/TeamRole";
import { TeamMember } from "../../models/TeamMember";

export interface ITeamMemberRepositoryWrite {
  create(dto: TeamMemberDto): Promise<TeamMember>;
  update(teamId: number, userId: number, role: TeamRole): Promise<boolean>;
  delete(teamId: number, userId: number): Promise<boolean>;
}