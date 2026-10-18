import { insert } from "../helpers/db";
import { Row } from "./utils";

// user_id is nullable (ON DELETE SET NULL), so it defaults to null.
// Pass user_id: someId to attach an entry to a real user.
export function makeAuditLog(overrides: Row = {}) {
  return insert("audit_log", {
    user_id: null,
    action: "TEST_ACTION",
    entity: "game",
    entity_id: null,
    meta: null,
    ipAddress: "127.0.0.1",
    ...overrides,
  });
}
