import type { Config } from "@jest/types";

// Runs the Netlify function tests with ts-jest. Invoke via `npm run test:functions`.
const config: Config.InitialOptions = {
  rootDir: ".",
  verbose: true,
  testEnvironment: "<rootDir>/jest.environment.cjs",
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "netlify/tsconfig.json" }],
  },
  testMatch: ["<rootDir>/**/__tests__/**/*.test.ts"],
};
export default config;
