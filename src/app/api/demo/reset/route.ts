import { resetPublicDemo } from "./reset-demo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    return Response.json(resetPublicDemo());
  } catch {
    return Response.json(
      { error: "Public demo reset failed. Run pnpm db:migrate." },
      { status: 500 }
    );
  }
}
