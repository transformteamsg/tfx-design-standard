import type { MdxComponentImporters } from "@/components/doc-page";
import { codeMdxComponentImporters } from "@/components/mdx-code-importers";

export const standardMdxComponentImporters: MdxComponentImporters = {
  ...codeMdxComponentImporters,
  DoDont: async () => {
    const { DoDont } = await import("@/components/foundations/do-dont");
    return { DoDont };
  },
  ComponentsUsed: async () => {
    const { ComponentsUsed } = await import("@/components/foundations/components-used");
    return { ComponentsUsed };
  },
  GroupGrid: async () => {
    const { GroupGrid } = await import("@/components/foundations/group-grid");
    return { GroupGrid };
  },
  PrincipleGrid: async () => {
    const { PrincipleGrid } = await import("@/components/foundations/principle-grid");
    return { PrincipleGrid };
  },
  PatternGrid: async () => {
    const { PatternGrid } = await import("@/components/foundations/pattern-grid");
    return { PatternGrid };
  },
  SourceLink: async () => {
    const { SourceLink } = await import("@/components/foundations/source-link");
    return { SourceLink };
  },
  Checklist: async () => {
    const { Checklist, Check } = await import("@/components/foundations/checklist");
    return { Checklist, Check };
  },
  Check: async () => {
    const { Checklist, Check } = await import("@/components/foundations/checklist");
    return { Checklist, Check };
  },
  Glossary: async () => {
    const { Glossary, Term } = await import("@/components/foundations/glossary");
    return { Glossary, Term };
  },
  Term: async () => {
    const { Glossary, Term } = await import("@/components/foundations/glossary");
    return { Glossary, Term };
  },
  MotionScale: async () => {
    const { MotionScale } = await import("@/components/diagrams/motion-scale");
    return { MotionScale };
  },
  OrbitLoop: async () => {
    const { OrbitLoop } = await import("@/components/diagrams/orbit-loop");
    return { OrbitLoop };
  },
  ColorRamp: async () => {
    const { ColorRamp } = await import("@/components/foundations/color-ramp");
    return { ColorRamp };
  },
  PrimarySwatches: async () => {
    const { PrimarySwatches } = await import("@/components/foundations/primary-swatches");
    return { PrimarySwatches };
  },
  FunctionalColours: async () => {
    const { FunctionalColours } = await import("@/components/foundations/functional-colours");
    return { FunctionalColours };
  },
  TokenTable: async () => {
    const { TokenTable } = await import("@/components/foundations/token-table");
    return { TokenTable };
  },
  TypeScale: async () => {
    const { TypeScale, FontRoles } = await import("@/components/foundations/type-scale");
    return { TypeScale, FontRoles };
  },
  FontRoles: async () => {
    const { TypeScale, FontRoles } = await import("@/components/foundations/type-scale");
    return { TypeScale, FontRoles };
  },
  SpacingScale: async () => {
    const { SpacingScale } = await import("@/components/foundations/spacing-scale");
    return { SpacingScale };
  },
  RadiusScale: async () => {
    const { RadiusScale } = await import("@/components/foundations/radius-scale");
    return { RadiusScale };
  },
  IconSet: async () => {
    const { IconSet } = await import("@/components/foundations/icon-set");
    return { IconSet };
  },
  BrandIconSet: async () => {
    const { BrandIconSet } = await import("@/components/foundations/brand-icon-set");
    return { BrandIconSet };
  },
};
