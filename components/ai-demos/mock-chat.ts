"use client";

import type { UIMessage, UIMessageChunk } from "ai";

/* Keyword-matched canned responses for TFX teacher scenarios.
   Each entry has an optional reasoning block and optional sources. */

interface CannedResponse {
  reasoning?: string;
  text: string;
  sources?: Array<{ sourceId: string; url: string; title: string }>;
}

function matchResponse(messages: UIMessage[]): CannedResponse {
  const last = messages[messages.length - 1];
  const text =
    last?.role === "user"
      ? (last.parts ?? [])
          .filter((p) => p.type === "text")
          .map((p) => (p as { type: "text"; text: string }).text)
          .join(" ")
          .toLowerCase()
      : "";

  if (text.includes("summarise") || text.includes("summarize") || text.includes("reading")) {
    return {
      reasoning:
        "The teacher asked for a reading-progress summary. I will check Term 2 guided-reading session logs, fluency assessments, and comprehension scores for Ahmad before synthesising a brief update.",
      text: "Ahmad has made solid progress in Term 2. He moved from Band 1 to Band 2 in guided reading, completing 14 of 15 scheduled sessions. His fluency score improved from 67 to 84 words per minute, and comprehension check scores averaged 72% — up from 58% last term.\n\nHis strongest area is literal recall. Inferential questions remain a development focus, particularly when texts use unfamiliar cultural context.",
      sources: [
        {
          sourceId: "src-1",
          url: "https://casesync.school/records/ahmad/guided-reading-t2",
          title: "Guided reading log — Ahmad, Term 2",
        },
        {
          sourceId: "src-2",
          url: "https://casesync.school/assessments/ahmad/fluency-t2",
          title: "Fluency assessment — Ahmad, Term 2",
        },
      ],
    };
  }

  if (text.includes("flag") || text.includes("below") || text.includes("band")) {
    return {
      reasoning:
        "The teacher wants students below a reading band threshold. I will cross-reference current band assignments against the Band 2 benchmark and list students who have not yet reached it.",
      text: "Three students in Class 5A are currently reading below Band 2:\n\n- **Lena K.** — Band 1, last assessed Week 7\n- **Marcus T.** — Band 1, last assessed Week 8\n- **Priya S.** — Band 1 (provisional), assessment overdue\n\nRecommended next step: schedule targeted small-group sessions before the end-of-term checkpoint.",
      sources: [
        {
          sourceId: "src-1",
          url: "https://casesync.school/class/5a/reading-bands",
          title: "Reading band summary — Class 5A",
        },
      ],
    };
  }

  if (text.includes("comment") || text.includes("draft") || text.includes("report")) {
    return {
      text: "Here is a draft end-of-term comment for Ahmad:\n\n> Ahmad has demonstrated consistent effort throughout Term 2 and is meeting year-level reading benchmarks. He shows strong literal comprehension and is growing in confidence during guided reading sessions. A focus area for Term 3 is extending his inferential thinking when working with texts that draw on unfamiliar cultural contexts.\n\nFeel free to adjust tone or add specific examples before sharing with parents.",
    };
  }

  return {
    text: "I can help with reading progress summaries, flagging students below benchmark, or drafting end-of-term comments. What would you like to know about your class?",
  };
}

/* Streams a string word-by-word with small random delays, respecting
   the abort signal and the prefers-reduced-motion preference. */
async function* streamWords(
  text: string,
  abortSignal: AbortSignal,
  instant: boolean
): AsyncGenerator<string> {
  if (instant) {
    yield text;
    return;
  }
  const words = text.split(" ");
  for (let i = 0; i < words.length; i++) {
    if (abortSignal.aborted) return;
    yield (i === 0 ? "" : " ") + words[i];
    await new Promise<void>((resolve, reject) => {
      const delay = 30 + Math.random() * 50;
      const t = setTimeout(resolve, delay);
      abortSignal.addEventListener("abort", () => {
        clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      });
    }).catch(() => {
      /* aborted — stop gracefully */
      return;
    });
    if (abortSignal.aborted) return;
  }
}

/* Creates a ReadableStream<UIMessageChunk> from a CannedResponse,
   streaming reasoning tokens first then text tokens. */
function buildStream(
  response: CannedResponse,
  abortSignal: AbortSignal,
  instant: boolean
): ReadableStream<UIMessageChunk> {
  const reasoningId = "r-1";
  const textId = "t-1";

  return new ReadableStream<UIMessageChunk>({
    async start(controller) {
      try {
        /* ── Reasoning block ── */
        if (response.reasoning) {
          controller.enqueue({ type: "reasoning-start", id: reasoningId });
          for await (const chunk of streamWords(response.reasoning, abortSignal, instant)) {
            if (abortSignal.aborted) break;
            controller.enqueue({ type: "reasoning-delta", id: reasoningId, delta: chunk });
          }
          if (!abortSignal.aborted) {
            controller.enqueue({ type: "reasoning-end", id: reasoningId });
          }
        }

        /* ── Sources (emitted before text so UI can show them early) ── */
        if (!abortSignal.aborted && response.sources) {
          for (const src of response.sources) {
            controller.enqueue({
              type: "source-url",
              sourceId: src.sourceId,
              url: src.url,
              title: src.title,
            });
          }
        }

        /* ── Text block ── */
        if (!abortSignal.aborted) {
          controller.enqueue({ type: "text-start", id: textId });
          for await (const chunk of streamWords(response.text, abortSignal, instant)) {
            if (abortSignal.aborted) break;
            controller.enqueue({ type: "text-delta", id: textId, delta: chunk });
          }
          if (!abortSignal.aborted) {
            controller.enqueue({ type: "text-end", id: textId });
          }
        }
      } catch {
        /* aborted or other error — close cleanly */
      } finally {
        controller.close();
      }
    },
  });
}

/* Public transport class.  Reads prefers-reduced-motion at call time
   so it picks up SSR/hydration correctly. */
export class MockChatTransport {
  async sendMessages(options: {
    trigger: string;
    chatId: string;
    messageId?: string;
    messages: UIMessage[];
    abortSignal?: AbortSignal;
    headers?: Record<string, string> | Headers;
    body?: Record<string, unknown>;
    metadata?: unknown;
  }): Promise<ReadableStream<UIMessageChunk>> {
    const instant =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const response = matchResponse(options.messages);
    const signal = options.abortSignal ?? new AbortController().signal;

    /* Small initial delay to mimic network round-trip */
    if (!instant) {
      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(resolve, 300);
        signal.addEventListener("abort", () => {
          clearTimeout(t);
          reject(new DOMException("Aborted", "AbortError"));
        });
      }).catch(() => {});
    }

    return buildStream(response, signal, instant);
  }

  async reconnectToStream(): Promise<ReadableStream<UIMessageChunk> | null> {
    return null;
  }
}
