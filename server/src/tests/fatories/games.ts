import { insert } from "../helpers/db";
import { next, Row } from "./utils";

export function makeGame(overrides: Row = {}) {
  const n = next();
  return insert("games", {
    game_name: `Game ${n}`,            // UNIQUE
    game_logotip: "logo.png",
    game_genre: "Strategy",
    players_per_team: 5,
    ...overrides,
  });
}
