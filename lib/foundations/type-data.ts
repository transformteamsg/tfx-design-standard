/* Type-scale data (TYP-3) shared by the TypeScale specimen and, per plan 003,
   the future /foundations/tokens page. If the catalog scale changes, update
   this file and the typography.mdx prose together. */

export type TypeRow = {
  step: string;
  px: number;
  font: "display" | "body";
  weight: number;
  note?: string;
};

export const TYPE_SCALE: TypeRow[] = [
  {
    step: "Display",
    px: 48,
    font: "display",
    weight: 600,
    note: "Also 72 / 96 / 120px for landing surfaces.",
  },
  { step: "Heading 1", px: 32, font: "display", weight: 600 },
  { step: "Heading 2", px: 24, font: "display", weight: 600 },
  { step: "Heading 3", px: 20, font: "display", weight: 600 },
  { step: "Body Large", px: 18, font: "body", weight: 400 },
  { step: "Body", px: 16, font: "body", weight: 400 },
  { step: "Body Small", px: 14, font: "body", weight: 400 },
  { step: "Caption", px: 12, font: "body", weight: 500 },
  {
    step: "Label",
    px: 11,
    font: "body",
    weight: 600,
    note: "Sentence case, not all-caps (TYP-4).",
  },
];
