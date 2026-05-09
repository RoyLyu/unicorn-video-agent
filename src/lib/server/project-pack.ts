import { getProductionPackByProjectId } from "@/db/repositories/production-pack-repository";

export function loadProjectPack(projectId: string) {
  try {
    return getProductionPackByProjectId(projectId);
  } catch {
    return null;
  }
}
