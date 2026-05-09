import type { DbClient } from "@/db/index";
import { seedPublicDemoProjects } from "@/lib/demo-public/seed-public-demo";

export function resetPublicDemo(client?: DbClient) {
  return seedPublicDemoProjects(client);
}
