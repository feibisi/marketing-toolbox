import { z } from 'zod';
import { CanonicalEntitySchema } from './entities';

export const WorkbenchThemeSchema = z.enum(['classic', 'whiteboard', 'dark']);
export type WorkbenchTheme = z.infer<typeof WorkbenchThemeSchema>;

export const EvidenceKindSchema = z.enum(['fact', 'assumption', 'to_verify']);
export type EvidenceKind = z.infer<typeof EvidenceKindSchema>;

export const EvidenceStatusSchema = z.enum(['draft', 'confirmed', 'rejected']);
export type EvidenceStatus = z.infer<typeof EvidenceStatusSchema>;

export const EvidenceItemSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  toolId: z.string().min(1),
  fieldPath: z.string().default('general'),
  statement: z.string().min(1),
  kind: EvidenceKindSchema.default('assumption'),
  source: z.string().default(''),
  status: EvidenceStatusSchema.default('draft'),
  owner: z.string().default(''),
  reviewDate: z.string().default(''),
  updatedAt: z.string(),
});

export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

export const DecisionLogSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  title: z.string().min(1),
  decision: z.string().min(1),
  rationale: z.string().default(''),
  decidedBy: z.string().default(''),
  decidedAt: z.string(),
});

export type DecisionLog = z.infer<typeof DecisionLogSchema>;

export const ToolDocStatusSchema = z.enum(['empty', 'draft', 'ready']);
export type ToolDocStatus = z.infer<typeof ToolDocStatusSchema>;

export const ToolDocumentSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  toolId: z.string().min(1),
  schemaVersion: z.number().int().min(1).default(1),
  entityRefs: z.array(z.string()).default([]),
  data: z.record(z.string(), z.unknown()).default({}),
  status: ToolDocStatusSchema.default('draft'),
  updatedAt: z.string(),
  version: z.number().int().min(1).default(1),
});

export type ToolDocument = z.infer<typeof ToolDocumentSchema>;

export const ProjectV3Schema = z.object({
  id: z.string().min(1),
  workspaceId: z.string().default('local-default'),
  name: z.string().min(1),
  brand: z.string().default(''),
  owner: z.string().default(''),
  objective: z.string().default(''),
  stage: z.enum(['discovery', 'active', 'review', 'archived']).default('active'),
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number().int().min(1).default(1),
});

export type ProjectV3 = z.infer<typeof ProjectV3Schema>;

export const ProjectBundleSchema = z.object({
  schemaVersion: z.literal('3.0'),
  exportedAt: z.string(),
  project: ProjectV3Schema,
  entities: z.array(CanonicalEntitySchema),
  documents: z.record(z.string(), ToolDocumentSchema),
  evidences: z.array(EvidenceItemSchema),
  decisions: z.array(DecisionLogSchema),
});

export type ProjectBundle = z.infer<typeof ProjectBundleSchema>;

export const WorkspaceStoreSchema = z.object({
  schemaVersion: z.literal('3.0'),
  activeProjectId: z.string(),
  projects: z.record(z.string(), ProjectBundleSchema),
});

export type WorkspaceStore = z.infer<typeof WorkspaceStoreSchema>;
