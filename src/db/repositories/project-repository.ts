import { desc, eq } from "drizzle-orm";

import { getDbClient, type DbClient } from "../index";
import { videoProjects, type VideoProjectRow } from "../schema";

export type RecentProject = {
  id: string;
  title: string;
  sourceName: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectDetail = RecentProject & {
  articleId: string;
};

export function listRecentProjects(
  limit = 10,
  client: DbClient = getDbClient()
): RecentProject[] {
  return client.db
    .select({
      id: videoProjects.id,
      title: videoProjects.title,
      sourceName: videoProjects.sourceName,
      status: videoProjects.status,
      createdAt: videoProjects.createdAt,
      updatedAt: videoProjects.updatedAt
    })
    .from(videoProjects)
    .orderBy(desc(videoProjects.createdAt))
    .limit(limit)
    .all();
}

export function getProjectById(
  projectId: string,
  client: DbClient = getDbClient()
): ProjectDetail | null {
  const row = client.db
    .select()
    .from(videoProjects)
    .where(eq(videoProjects.id, projectId))
    .get();

  return row ? toProjectDetail(row) : null;
}

export function toProjectDetail(row: VideoProjectRow): ProjectDetail {
  return {
    id: row.id,
    articleId: row.articleId,
    title: row.title,
    sourceName: row.sourceName,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}
