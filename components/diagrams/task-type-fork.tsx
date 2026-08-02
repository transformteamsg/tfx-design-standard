/* Decision fork illustrating that the right AI response depends on task type.
   Learner asks -> Fact (answer immediately), Procedure (answer + show step),
   Judgement or craft (guide, do not answer). */

export function TaskTypeFork() {
  return (
    <figure className="not-prose my-6 flex justify-center rounded-lg border border-border bg-surface p-6">
      <svg
        viewBox="0 0 640 260"
        className="w-full max-w-[560px] text-foreground"
        role="img"
        aria-label="Learner asks; the right AI response depends on task type - fact answered, procedure answered with step, judgement guided not answered"
      >
        {/* Input node */}
        <g>
          <rect x="20" y="110" width="150" height="60" rx="10" fill="var(--muted)" stroke="var(--border)" strokeWidth="1.5" />
          <text x="95" y="138" textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">Learner asks</text>
          <text x="95" y="156" textAnchor="middle" fontSize="11" fill="var(--muted-foreground)">something</text>
        </g>

        {/* Branch lines */}
        <g stroke="var(--border)" strokeWidth="1.5" fill="none">
          <path d="M 170 140 L 235 40" />
          <path d="M 170 140 L 235 140" />
          <path d="M 170 140 L 235 240" />
        </g>

        {/* Fact branch */}
        <g>
          <rect x="240" y="14" width="380" height="52" rx="10" fill="var(--success-subtle)" stroke="var(--success)" strokeWidth="1" />
          <text x="255" y="34" fontSize="11" fontWeight="600" fill="var(--success)">Fact</text>
          <text x="255" y="52" fontSize="12" fill="currentColor">{`Answer immediately - "the deadline is Friday"`}</text>
        </g>

        {/* Procedure branch */}
        <g>
          <rect x="240" y="114" width="380" height="52" rx="10" fill="var(--warning-subtle)" stroke="var(--warning)" strokeWidth="1" />
          <text x="255" y="134" fontSize="11" fontWeight="600" fill="var(--warning)">Procedure</text>
          <text x="255" y="152" fontSize="12" fill="currentColor">{`Answer + show the step - "here is where to click"`}</text>
        </g>

        {/* Judgement branch */}
        <g>
          <rect x="240" y="214" width="380" height="52" rx="10" fill="var(--danger-subtle)" stroke="var(--danger)" strokeWidth="1" />
          <text x="255" y="234" fontSize="11" fontWeight="600" fill="var(--danger)">Judgement or craft</text>
          <text x="255" y="252" fontSize="12" fill="currentColor">Hold back - ask a guiding question, offer a scaffold</text>
        </g>
      </svg>
    </figure>
  );
}
