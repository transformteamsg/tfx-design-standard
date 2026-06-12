import { llmsBody, controlDetails } from "@/lib/llms";

export const dynamic = "force-static";

export function GET() {
  const header = `# TFX Design Standard (v0.1 draft) — full text for AI agents, including control details
# Everything in /llms.txt plus per-control rationale, pass/fail examples,
# and evaluator guidance for judgment and hybrid controls.
`;

  const details = `\n\n## ===== CONTROL DETAILS =====\n\n${controlDetails()}`;

  return new Response(header + llmsBody() + details, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
