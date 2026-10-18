import { insert } from "../helpers/db";
import { makeTournament } from "./tournaments";
import { makeUser } from "./users";
import { resolveId, Row } from "./utils";

export async function makeWatchlistEntry(overrides: Row = {}) {
  const user_id = (await resolveId(overrides, "user_id", () => makeUser())) as number;
  const tournament_id = (await resolveId(overrides, "tournament_id", () => makeTournament())) as number;

  await insert("user_watchlist", { user_id, tournament_id, ...overrides });

  return { user_id, tournament_id };
}
