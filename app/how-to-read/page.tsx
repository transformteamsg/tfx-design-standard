export const metadata = { title: "How to read this" };

export default function Page() {
  return (
    <article className="prose">
      <h1>How to read this standard</h1>
      <p>
        The standard is a ladder. Each layer answers a different question and carries different
        authority — getting the line between them right matters more than the labels.
      </p>
      <table>
        <thead>
          <tr><th>Layer</th><th>Answers</th><th>Authority</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>Principles</strong></td><td>Why</td><td>Used to decide, not to check</td></tr>
          <tr><td><strong>Standards</strong></td><td>Must</td><td>Required; verified by checks. L0 blocks, L1 needs a documented waiver</td></tr>
          <tr><td><strong>Guidelines</strong></td><td>Should</td><td>Judgement applies; deviation needs a reason</td></tr>
          <tr><td><strong>Foundations</strong></td><td>With what</td><td>Build from these by default</td></tr>
          <tr><td><strong>Harness</strong></td><td>How, fast</td><td>Use the skills and tools; improve them</td></tr>
        </tbody>
      </table>
      <blockquote>
        <p>
          <strong>The one litmus test:</strong> if you can&apos;t check it, it&apos;s a principle or a
          guideline — not a standard. Standards are the only layer the harness can enforce
          automatically.
        </p>
      </blockquote>
      <h2>Status labels</h2>
      <p>
        <strong>Settled</strong> content exists in the Brand OS today or has been agreed.{" "}
        <strong>⚑ Proposed</strong> content is an opinionated position taken so the team has
        something concrete to react to — react, don&apos;t obey.
      </p>
      <h2>Mission</h2>
      <p>
        Make the quality bar independent of staffing. A builder&apos;s intent should survive — without
        loss — all the way to shipped UI that meets our bar in both aesthetics and UX, while moving
        reasonably faster. The harness carries the repetitive 80%; your judgement goes to the hard,
        novel 20%.
      </p>
    </article>
  );
}
