/* Placeholder slot for Midjourney illustration. The illustration guideline is
   strict: Midjourney with the brand SREF only, no hand-coded fallback art —
   so the slot stays visibly empty and hands you the exact prompt to run. */

const SREF = "--sref 2544305963::2 4104856457";

function aspectOf(subject: string): string {
  const ar = subject.match(/--ar (\d+):(\d+)/);
  return ar ? `${ar[1]} / ${ar[2]}` : "8 / 5";
}

export function Illo({ subject }: { subject: string }) {
  return (
    <figure className="my-8">
      <div
        className="grid place-items-center rounded-lg border border-dashed border-border bg-surface"
        style={{ aspectRatio: aspectOf(subject) }}
      >
        <p className="max-w-[44ch] px-6 text-center text-[14px] leading-[1.6] text-muted-foreground">
          Illustration slot. Generate with the prompt below, regenerate if
          off-brand, then place the approved file from the library here.
        </p>
      </div>
      <figcaption className="mt-2.5">
        <code className="block select-all rounded-md border border-border bg-surface px-3.5 py-2.5 text-[12px] leading-[1.6] text-muted-foreground">
          {subject} {SREF}
        </code>
      </figcaption>
    </figure>
  );
}
