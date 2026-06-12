import { llmsBody } from "@/lib/llms";

export const dynamic = "force-static";

export function GET() {
  const header = `# TFX Design Standard (v0.1 draft) — full text for AI agents
# TransformX, Teacher & School portfolio, GovTech Singapore.
# Mission: make the quality bar independent of staffing. Brand essence: Kind Utility —
# utility-first at the core, human-first at the surface.
# The one test: does this help teachers work faster with less stress? If not, don't build it.
# Litmus for standards: if you can't check it, it's a principle or guideline, not a standard.
# Tiers: L0 non-negotiable (no waiver) / L1 mandatory (documented waiver) / L2 recommended (inline rationale).
# Waiver syntax: tfx-waive <ID> reason="<specific reason>"
# Stack: Base UI components + Radix Colors + shadcn/ui default tokens. Fonts: Plus Jakarta Sans (display), Inter (body).
# Control rationale and pass/fail examples: /llms-full.txt
`;

  return new Response(header + llmsBody(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
