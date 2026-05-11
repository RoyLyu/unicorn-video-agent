import { z } from "zod";

const NonEmptyString = z.string().trim().min(1);

export const FactCheckStatusSchema = z.enum([
  "pending",
  "verified",
  "needs_review",
  "rejected"
]);

export const PublishCopyInputSchema = z.object({
  coverTitle: NonEmptyString,
  titleCandidates: z.array(NonEmptyString).min(1),
  publishText: NonEmptyString,
  tags: z.array(NonEmptyString).min(1),
  riskNotice: NonEmptyString
});

export const FactCheckInputSchema = z.object({
  id: z.string().optional(),
  itemType: NonEmptyString,
  label: NonEmptyString,
  value: z.string(),
  sourceUrl: z.string(),
  status: FactCheckStatusSchema,
  notes: z.string()
});

export const ReviewChecklistInputSchema = z.object({
  key: NonEmptyString,
  label: NonEmptyString,
  completed: z.boolean()
});

export const ReviewPayloadSchema = z.object({
  checklist: z.array(ReviewChecklistInputSchema),
  publishCopy: PublishCopyInputSchema,
  factChecks: z.array(FactCheckInputSchema)
});

export type FactCheckStatus = z.infer<typeof FactCheckStatusSchema>;
export type PublishCopyInput = z.infer<typeof PublishCopyInputSchema>;
export type FactCheckInput = z.infer<typeof FactCheckInputSchema>;
export type ReviewChecklistInput = z.infer<typeof ReviewChecklistInputSchema>;
export type ReviewPayload = z.infer<typeof ReviewPayloadSchema>;
