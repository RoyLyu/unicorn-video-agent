import { desc, eq } from "drizzle-orm";

import { getDbClient, type DbClient } from "../index";
import { videoProjects, type VideoProjectRow } from "../schema";

export type RecentProject = {
  id: string;
  title: string;
  sourceName: string;
  status: string;
  isDemo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProjectDetail = RecentProject & {
  articleId: string;
};

type ListRecentProjectsOptions = {
  includeDemo?: boolean;
};

export function listRecentProjects(
  limit = 10,
  options: ListRecentProjectsOptions = {},
  client: DbClient = getDbClient()
): RecentProject[] {
  const includeDemo = options.includeDemo ?? true;
  const query = client.db
    .select({
      id: videoProjects.id,
      title: videoProjects.title,
      sourceName: videoProjects.sourceName,
      status: videoProjects.status,
      isDemo: videoProjects.isDemo,
      createdAt: videoProjects.createdAt,
      updatedAt: videoProjects.updatedAt
    })
    .from(videoProjects);

  if (!includeDemo) {
    return query
      .where(eq(videoProjects.isDemo, false))
      .orderBy(desc(videoProjects.createdAt))
      .limit(limit)
      .all();
  }

  return query.orderBy(desc(videoProjects.createdAt)).limit(limit).all();
}

export function listDemoProjects(
  limit = 10,
  client: DbClient = getDbClient()
): RecentProject[] {
  return client.db
    .select({
      id: videoProjects.id,
      title: videoProjects.title,
      sourceName: videoProjects.sourceName,
      status: videoProjects.status,
      isDemo: videoProjects.isDemo,
      createdAt: videoProjects.createdAt,
      updatedAt: videoProjects.updatedAt
    })
    .from(videoProjects)
    .where(eq(videoProjects.isDemo, true))
    .orderBy(desc(videoProjects.createdAt))
    .limit(limit)
    .all();
}

export function deleteDemoProjects(client: DbClient = getDbClient()): number {
  const result = client.db
    .delete(videoProjects)
    .where(eq(videoProjects.isDemo, true))
    .run();

  return result.changes;
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
    isDemo: row.isDemo,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}
