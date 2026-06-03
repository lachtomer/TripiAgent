import fs from "fs";
import path from "path";

const HEBREW_SCRIPT = /[\u0590-\u05FF]/;

const SCAN_DIRS = ["app", "components", "stores", "lib"] as const;

/** Paths relative to repo root; entire file skipped (Hebrew catalog allowed here only). */
const SKIP_RELATIVE_FILES = new Set(["lib/translations.ts"]);

export type HebrewChromeViolation = {
  file: string;
  line: number;
  text: string;
};

function listSourceFiles(repoRoot: string, dirName: string): string[] {
  const dirPath = path.join(repoRoot, dirName);
  if (!fs.existsSync(dirPath)) return [];

  const out: string[] = [];
  const walk = (current: string) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.(tsx?|jsx?)$/.test(entry.name)) continue;
      const rel = path.relative(repoRoot, full).split(path.sep).join("/");
      if (SKIP_RELATIVE_FILES.has(rel)) continue;
      if (/\.(test|spec)\.(tsx?|jsx?)$/.test(rel)) continue;
      out.push(full);
    }
  };
  walk(dirPath);
  return out;
}

export function scanForHebrewChrome(repoRoot: string = process.cwd()): HebrewChromeViolation[] {
  const violations: HebrewChromeViolation[] = [];

  for (const dir of SCAN_DIRS) {
    for (const filePath of listSourceFiles(repoRoot, dir)) {
      const rel = path.relative(repoRoot, filePath).split(path.sep).join("/");
      const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
      lines.forEach((line, index) => {
        if (HEBREW_SCRIPT.test(line)) {
          violations.push({
            file: rel,
            line: index + 1,
            text: line.trim().slice(0, 120),
          });
        }
      });
    }
  }

  return violations;
}
