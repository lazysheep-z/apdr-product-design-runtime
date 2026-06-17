import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";
import type { RulesFile } from "../types.js";

export function loadRules(rulesPath: string): RulesFile {
  const raw = readFileSync(rulesPath, "utf8");
  const parsed = parseYaml(raw) as RulesFile;
  if (!parsed?.rules?.length) {
    throw new Error(`No rules found in ${rulesPath}`);
  }
  parsed.baseScore ??= 100;
  parsed.minPassScore ??= 60;
  parsed.rules = parsed.rules.filter((r) => r.enabled !== false);
  return parsed;
}
