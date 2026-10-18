import { insert } from "../helpers/db";
import { makeMatch } from "./matches";
import { makeTeamMember } from "./team-members";
import { Row } from "./utils";

/**
 * match_players has a composite FK to team_members, so the (team_id, user_id)
 * pair must already be a team member. If you pass both, they must exist.
 * If you pass neither (or one), a team member is created for you.
 * If no match_id is given, a match is created with that team as the blue team.
 */
export async function makeMatchPlayer(overrides: Row = {}) {
  let team_id = overrides.team_id as number | undefined;
  let user_id = overrides.user_id as number | undefined;

  if (team_id === undefined || user_id === undefined) {
    const member = await makeTeamMember({
      ...(team_id !== undefined ? { team_id } : {}),
      ...(user_id !== undefined ? { user_id } : {}),
    });
    team_id = member.team_id;
    user_id = member.user_id;
  }

  const match_id =
    (overrides.match_id as number | undefined) ?? (await makeMatch({ blue_team_id: team_id }));

  await insert("match_players", {
    user_id,
    team_id,
    match_id,
    performance_notes: null,
    ...overrides,
  });

  return { user_id, team_id, match_id };
}
