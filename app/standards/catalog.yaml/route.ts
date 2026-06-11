import fs from "node:fs";
import path from "node:path";

export function GET() {
  const file = path.join(process.cwd(), "content", "standards", "catalog.yaml");
  return new Response(fs.readFileSync(file, "utf8"), {
    headers: { "content-type": "text/yaml; charset=utf-8" },
  });
}
