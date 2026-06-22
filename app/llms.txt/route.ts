import { llmsIndex } from "@/lib/llms";

export const dynamic = "force-static";

/* /llms.txt is the curated index (llmstxt.org). The full concatenation lives
   at /llms-full.txt, which this index links under "Optional". */
export function GET() {
  return new Response(llmsIndex(), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
}
