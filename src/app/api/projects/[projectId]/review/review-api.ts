import type { DbClient } from "@/db";
import {
  getReviewData,
  saveReviewData
} from "@/db/repositories/review-repository";
import { ReviewPayloadSchema, type ReviewPayload } from "@/lib/review/review-schemas";

export function getReviewApiPayload(projectId: string, client?: DbClient) {
  return getReviewData(projectId, client);
}

export function saveReviewApiPayload(
  projectId: string,
  payload: ReviewPayload,
  client?: DbClient
) {
  const parsed = ReviewPayloadSchema.parse(payload);

  return saveReviewData(projectId, parsed, client);
}
