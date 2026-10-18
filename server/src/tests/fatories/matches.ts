import { insert } from "../helpers/db";
import { makeTeam } from "./teams";
import { makeTournament } from "./tournaments";
import { resolveId, Row } from "./utils";

/**
 * By default creates a tournament and two different teams.
 * For empty bracket slots pass blue_team_id: null / red_team_id: null.
 * To link matches, create the next match first and pass its id as
 * winner_to_match_id / loser_to_match_id.
 */
export async function makeMatch(overrides: Row = {}) {
  const tournament_id = await resolveId(overrides, "tournament_id", () => makeTournament());
  const blue_team_id = await resolveId(overrides, "blue_team_id", () => makeTeam());
  const red_team_id = await resolveId(overrides, "red_team_id", () => makeTeam());

  return insert("matches", {
    tournament_id,
    blue_team_id,
    red_team_id,
    winner_team_id: null,
    status: "scheduled",
    round_number: 1,
    bracket_type: null,
    blue_team_score: null,
    red_team_score: null,
    winner_to_match_id: null,
    winner_to_slot: null,
    loser_to_match_id: null,
    loser_to_slot: null,
    ...overrides,
  });
}
