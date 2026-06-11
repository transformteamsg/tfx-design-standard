import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-static";

function read(p: string) {
  return fs.readFileSync(path.join(process.cwd(), "content", p), "utf8");
}

export function GET() {
  const sections = [
    ["principles/brand-principles.mdx", "PRINCIPLES — BRAND"],
    ["principles/product-design-principles.mdx", "PRINCIPLES — PRODUCT DESIGN"],
    ["standards/catalog.yaml", "STANDARDS — CONTROL CATALOG (YAML)"],
    ["guidelines/voice-tone.mdx", "GUIDELINES — VOICE & TONE"],
    ["guidelines/naming.mdx", "GUIDELINES — NAMING"],
    ["guidelines/interaction.mdx", "GUIDELINES — INTERACTION"],
    ["guidelines/web-interface.mdx", "GUIDELINES — WEB INTERFACE"],
    ["guidelines/data-viz.mdx", "GUIDELINES — DATA VISUALIZATION"],
    ["guidelines/illustration.mdx", "GUIDELINES — ILLUSTRATION"],
    ["foundations/colour.mdx", "FOUNDATIONS — COLOUR"],
    ["foundations/typography.mdx", "FOUNDATIONS — TYPOGRAPHY"],
    ["foundations/spacing-radius.mdx", "FOUNDATIONS — SPACING & RADIUS"],
    ["foundations/iconography.mdx", "FOUNDATIONS — ICONOGRAPHY"],
    ["products/teacher-workspace.mdx", "PRODUCT — TEACHER WORKSPACE"],
    ["products/casesync.mdx", "PRODUCT — CASESYNC"],
    ["products/glow.mdx", "PRODUCT — GLOW"],
    ["harness/loop.mdx", "HARNESS — THE LOOP"],
    ["harness/skills.mdx", "HARNESS — SKILLS"],
    ["harness/tools.mdx", "HARNESS — TOOLS"],
    ["harness/on-ramp.mdx", "HARNESS — DESIGNER ON-RAMP"],
    ["governance/governance.mdx", "GOVERNANCE"],
  ];

  const header = `# TFX Design Standard (v0.1 draft) — full text for AI agents
# TransformX, Teacher & School portfolio, GovTech Singapore.
# Mission: make the quality bar independent of staffing. Brand essence: Kind Utility —
# utility-first at the core, human-first at the surface.
# The one test: does this help teachers work faster with less stress? If not, don't build it.
# Litmus for standards: if you can't check it, it's a principle or guideline, not a standard.
# Tiers: L0 non-negotiable (no waiver) / L1 mandatory (documented waiver) / L2 recommended (inline rationale).
# Waiver syntax: tfx-waive <ID> reason="<specific reason>"
# Stack: Base UI components + Radix Colors + shadcn/ui default tokens. Fonts: Plus Jakarta Sans (display), Inter (body).
`;

  const body = sections
    .map(([file, label]) => `\n\n## ===== ${label} =====\n\n${read(file)}`)
    .join("");

  return new Response(header + body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
