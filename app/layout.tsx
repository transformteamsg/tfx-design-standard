import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/topbar";

export const metadata: Metadata = {
  title: { default: "TFX Design Standard", template: "%s — TFX Design Standard" },
  description:
    "How TransformX designs the Teacher & School portfolio: principles, checkable standards, guidelines, foundations, and the AI design harness. For human builders and AI agents.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-surface focus:px-4 focus:py-2 focus:text-[14px] focus:font-medium focus:text-foreground focus:outline-2 focus:outline-offset-2 focus:outline-(--color-tw-blue)"
        >
          Skip to main content
        </a>
        <TopBar />
        <div className="mx-auto flex w-full max-w-[1320px]">
          <Sidebar />
          <main id="main-content" className="min-w-0 flex-1 px-6 py-10 lg:px-12">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
