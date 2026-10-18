import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
        globalSetup: ["./src/tests/globalSetup.ts"],
        setupFiles: ["./src/tests/setup.ts"],
        fileParallelism: false, // all test files share one DB
        env: {
            DB_MASTER_HOST: "127.0.0.1",
            DB_MASTER_PORT: "3307",
            DB_MASTER_USER: "root",
            DB_MASTER_PASSWORD: "test",
            DB_MASTER_NAME: "app_test",

            DB_SLAVE1_HOST: "", DB_SLAVE1_PORT: "", DB_SLAVE1_USER: "", DB_SLAVE1_PASSWORD: "", DB_SLAVE1_NAME: "",
            DB_SLAVE2_HOST: "", DB_SLAVE2_PORT: "", DB_SLAVE2_USER: "", DB_SLAVE2_PASSWORD: "", DB_SLAVE2_NAME: "",

            JWT_SECRET: "test-secret",
            SALT_ROUNDS: "4",              // low = faster bcrypt in tests
            HEALTH_CHECK_INTERVAL: "60000",
            CLIENT_URL: "http://localhost:5173",
        }
    },
});