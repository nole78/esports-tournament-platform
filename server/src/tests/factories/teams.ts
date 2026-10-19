import { insert } from "../helpers/db";
import { next, Row } from "./utils";

export function makeTeam(overrides: Row = {}) {
  const n = next();
  return insert("teams", {
    team_name: `Team ${n}`,                       // 2-80 chars, UNIQUE
    team_tag: `T${n.toString(36).toUpperCase()}`, // ^[A-Z0-9]{2,6}$, UNIQUE
    team_logotip: "logo.png",
    team_description: "Test team",
    ...overrides,
  });
}
