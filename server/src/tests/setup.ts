import { beforeAll, beforeEach } from "vitest";
import { db } from "../app";
import { resetDb } from "./helpers/db";

beforeAll(async () => {
  if (!process.env.DB_MASTER_NAME?.endsWith("_test")) {
    throw new Error("Refusing to run tests against a non-test database");
  }
  await db.init();
});

beforeEach(async () => {
  await resetDb();
});