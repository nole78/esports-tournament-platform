import { insert } from "../helpers/db";
import { makeGame } from "./games";
import { next, resolveId, Row } from "./utils";

export async function makeTournament(overrides: Row = {}) {
  const n = next();
  const tournament_game_id = await resolveId(overrides, "tournament_game_id", () => makeGame());

  return insert("tournaments", {
    tournament_name: `Tournament ${n}`,   // 3-120 chars, UNIQUE
    tournament_game_id,
    tournament_format: "single_elimination",
    tournament_max_teams: 8,              // 4-256, power of 2 unless round_robin
    tournament_application_deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    tournament_prize_fund: 1000,
    tournament_status: "upcoming",
    ...overrides,
  });
}
