import { insert } from "../helpers/db";
import { next, Row } from "./utils";

export function makeUser(overrides: Row = {}) {
  const n = next();
  return insert("users", {
    full_name: `Test User ${n}`,
    gamer_tag: `gamer${n}`,            // matches ^[a-zA-Z0-9.-]{3,30}$
    email: `user${n}@test.com`,
    passwordHash: "not-a-real-hash",   // for login tests pass a real bcrypt hash
    role: "player",
    profile_picture: null,
    isActive: 1,
    ...overrides,
  });
}
