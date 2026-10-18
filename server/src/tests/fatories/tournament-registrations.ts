import { insert } from "../helpers/db";
import { makeTeam } from "./teams";
import { makeTournament } from "./tournaments";
import { resolveId, Row } from "./utils";

export async function makeTournamentRegistration(overrides: Row = {}) {
  const team_id = (await resolveId(overrides, "team_id", () => makeTeam())) as number;
  const tournament_id = (await resolveId(overrides, "tournament_id", () => makeTournament())) as number;

  await insert("tournament_registrations", {
    team_id,
    tournament_id,
    seed: null,
    status: "pending",
    ...overrides,
  });

  return { team_id, tournament_id };
}
