import { insert } from "../helpers/db";
import { makeTeam } from "./teams";
import { makeUser } from "./users";
import { resolveId, Row } from "./utils";

// Composite primary key, so this returns the key instead of an insert id
export async function makeTeamMember(overrides: Row = {}) {
  const team_id = (await resolveId(overrides, "team_id", () => makeTeam())) as number;
  const user_id = (await resolveId(overrides, "user_id", () => makeUser())) as number;

  await insert("team_members", {
    team_id,
    user_id,
    role: "member",
    ...overrides,
  });

  return { team_id, user_id };
}
