import { listRecentProjects } from "@/db/repositories/project-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json({ projects: listRecentProjects() });
  } catch {
    return Response.json(
      {
        projects: [],
        warning: "SQLite database is not initialized. Run pnpm db:migrate."
      },
      { status: 200 }
    );
  }
}
