"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Shared layout for the AI chat demos so all four carry one rhythm.

   The DemoFrame figure IS the surface (border + radius + bg-surface), so the
   shell adds NO border/background of its own - a second bordered box here would
   be a nested card (SLP-4). Structure comes from spacing and a single hairline
   divider between the message region and the input region.

   Use with `<DemoFrame bleed>` so the frame drops its own padding and the shell
   owns a consistent p-4 inset with an edge-to-edge divider.

   One spacing source of truth, reused by every chat demo:
   - messages: p-4, gap-4 between messages
   - input:    border-t hairline, p-4                                        */

/** Message-region classes. Applied to ChatShellMessages, or passed to
 *  ConversationContent's className on Conversation-based demos so both paths
 *  land on the same rhythm without editing the AI Elements source. */
export const chatMessagesClass = "flex flex-col gap-4 p-4";

/** Input-region padding (no divider). */
export const chatInputClass = "p-4";

/** Scroll cap for demos whose message list grows unboundedly (the flagship
 *  chatbot). One value, shared by ChatShellMessages `scroll` and any
 *  Conversation-based demo that scrolls, so all capped demos match height. */
export const chatScrollClass = "max-h-[420px] overflow-y-auto";

export function ChatShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("flex flex-col", className)}>{children}</div>;
}

export function ChatShellMessages({
  children,
  scroll = false,
  className,
}: {
  children: ReactNode;
  /** Flagship chatbot only - grows unboundedly, so cap height and scroll.
      Scripted demos leave this off and sit at natural height (no clip). */
  scroll?: boolean;
  className?: string;
}) {
  return (
    <div className={cn(chatMessagesClass, scroll && chatScrollClass, className)}>
      {children}
    </div>
  );
}

export function ChatShellInput({
  children,
  divider = true,
  className,
}: {
  children: ReactNode;
  /** Top hairline separating the input from the messages above. Turn off when
      the input is the whole surface (no messages above it) so it doesn't
      double the frame's header border. */
  divider?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(chatInputClass, divider && "border-t border-border", className)}
    >
      {children}
    </div>
  );
}
