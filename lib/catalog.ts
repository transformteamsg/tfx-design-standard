import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

export type Control = {
  id: string;
  statement: string;
  tier: "L0" | "L1" | "L2";
  check: "deterministic" | "judgment" | "hybrid";
  category: string;
  fails_when?: string[];
  rationale?: string;
  status?: string;
};

export function getCatalog(): Control[] {
  const file = path.join(process.cwd(), "content", "standards", "catalog.yaml");
  const data = parse(fs.readFileSync(file, "utf8"));
  return data.controls as Control[];
}
