import { execSync } from "node:child_process";

const compose = "docker compose -f docker-compose.test.yml";

export default function setup() {
  execSync(`${compose} up -d --wait`, { stdio: "inherit" });

  return () => {
    if (process.env.KEEP_TEST_DB) return; // optional: skip cleanup while iterating
    execSync(`${compose} down`, { stdio: "inherit" });
  };
}