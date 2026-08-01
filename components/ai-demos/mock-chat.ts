"use client";

import type { UIMessage, UIMessageChunk } from "ai";

/* Keyword-matched canned responses for a shared education assistant.
   The four flagship chat demos each seed a different role - a teacher, a
   parent, a student, and an administrator - so the branches below are keyed
   on role-distinct phrases. Role branches are checked first, then the
   teacher branches, so a general word like "reading" does not steal a
   parent or student turn. Each entry has an optional reasoning block and
   optional sources. */

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

  /* ── Parent branch (conversation demo): plain language, no jargon, and a
        thing they can do at home. ── */
  if (
    text.includes("my daughter") ||
    text.includes("my son") ||
    text.includes("my child") ||
    text.includes("at home") ||
    text.includes("practise") ||
    text.includes("tricky") ||
    text.includes("finding")
  ) {
    return {
      text: "She has had a strong term in reading. She is now comfortable with the texts set for her year, and reads them with good expression.\n\nThe next step is inference - working out things the text implies but does not say outright. You can help at home by pausing during a story to ask \"why do you think they did that?\" There is nothing to worry about here; this is the normal next stage.",
    };
  }

  /* ── Student branch (streaming demo): help beats answer. The student asks
        for the piece to be written; the assistant scaffolds instead. ── */
  if (text.includes("write my") || text.includes("essay") || text.includes("my conclusion")) {
    return {
      text: "I can help you get there, but writing the conclusion for you would not be your work. Let us build it together.\n\nAnswer these three, in your own words:\n\n1. What is the one idea you most want the reader to remember about the water cycle?\n2. Which piece of evidence from your essay backs it up best?\n3. Why does it matter beyond the classroom - what does it explain about the world?\n\nDraft a sentence for each and I will help you tighten them.",
    };
  }

  /* ── Administrator branch (prompt-input demo): ops and records, not
        classroom teaching. ── */
  if (
    text.includes("enrol") ||
    text.includes("absence") ||
    text.includes("overdue") ||
    text.includes("form")
  ) {
    return {
      reasoning:
        "This is a records request. I will check the enrolment queue and the outstanding-forms list for this intake before summarising what still needs action.",
      text: "Three items need action for this week's intake:\n\n- **4 enrolment forms** submitted but not yet confirmed\n- **2 consent forms** overdue by more than five days\n- **1 record** with a missing date of birth, blocking confirmation\n\nRecommended next step: confirm the 4 complete forms, then chase the 2 overdue consents.",
      sources: [
        {
          sourceId: "src-1",
          url: "https://school.example/admin/enrolment-queue",
          title: "Enrolment queue - this intake",
        },
      ],
    };
  }

  if (text.includes("summarise") || text.includes("summarize") || text.includes("reading")) {
    return {
      reasoning:
        "The teacher asked for a reading-progress summary. I will check this term's guided-reading session logs, fluency checks, and comprehension scores for Mateo before writing a brief update.",
      text: "Mateo has made solid progress this term. He moved from level 2 to level 3 in guided reading, completing 14 of 15 scheduled sessions. His fluency score improved from 67 to 84 words per minute, and comprehension checks averaged 72% - up from 58% last term.\n\nHis strongest area is literal recall. Inferential questions remain a development focus, particularly when texts use unfamiliar cultural context.",
      sources: [
        {
          sourceId: "src-1",
          url: "https://school.example/records/mateo/guided-reading",
          title: "Guided reading log - Mateo, this term",
        },
        {
          sourceId: "src-2",
          url: "https://school.example/assessments/mateo/fluency",
          title: "Fluency check - Mateo, this term",
        },
      ],
    };
  }

  if (text.includes("flag") || text.includes("below") || text.includes("band")) {
    return {
      reasoning:
        "The teacher wants students below a reading level threshold. I will cross-reference current levels against the benchmark and list students who have not yet reached it.",
      text: "Three students in this class are currently reading below the benchmark:\n\n- **Lucia M.** - level 2, last checked Week 7\n- **Noah T.** - level 2, last checked Week 8\n- **Aisha R.** - level 2 (provisional), check overdue\n\nRecommended next step: schedule targeted small-group sessions before the term ends.",
      sources: [
        {
          sourceId: "src-1",
          url: "https://school.example/class/reading-levels",
          title: "Reading level summary - this class",
        },
      ],
    };
  }

  if (text.includes("comment") || text.includes("draft") || text.includes("report")) {
    return {
      text: "Here is a draft progress note for Mateo:\n\n> Mateo has demonstrated consistent effort this term and is meeting year-level reading benchmarks. He shows strong literal comprehension and is growing in confidence during guided reading sessions. A focus area for next term is extending his inferential thinking when working with texts that draw on unfamiliar cultural contexts.\n\nFeel free to adjust tone or add specific examples before sharing with families.",
    };
  }

  return {
    text: "I can help with that. Could you tell me a little more about what you are looking for?",
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
      /* aborted - stop gracefully */
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
        /* aborted or other error - close cleanly */
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

    const matched = matchResponse(options.messages);
    /* Web search gates citations: the real perplexity/sonar model returns
       sources only when search is on, so the mock mirrors that - Sources
       appear only when the caller passes body.webSearch. */
    const webSearch = options.body?.webSearch === true;
    const response: CannedResponse = webSearch
      ? matched
      : { ...matched, sources: undefined };
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
