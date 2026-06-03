/**
 * CLI wrapper — run via: npm run check:chrome
 * Source of truth test: lib/noHebrewChrome.test.ts
 */
import { execSync } from "child_process";

execSync("npx vitest run lib/noHebrewChrome.test.ts", { stdio: "inherit" });
