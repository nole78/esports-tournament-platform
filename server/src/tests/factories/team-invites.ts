import { insert } from "../helpers/db";
import { makeTeam } from "./teams";
import { makeUser } from "./users";
import { resolveId, Row } from "./utils";

export async function makeTeamInvite(overrides: Row = {}) {
  const user_id = (await resolveId(overrides, "user_id", () => makeUser())) as number;
  const team_id = (await resolveId(overrides, "team_id", () => makeTeam())) as number;

  await insert("team_invites", {
    user_id,
    team_id,
    status: "pending",
    ...overrides,
  });

  return { user_id, team_id };
}
