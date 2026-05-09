import type { AgentSlug } from "./agent-run-types";

export function createAgentContextSnapshot(
  agentSlug: AgentSlug,
  context: Record<string, unknown>
) {
  return {
    agentSlug,
    context,
    summary: summarizeJson(context)
  };
}

export function summarizeJson(value: unknown) {
  if (value === null || value === undefined) {
    return "empty";
  }

  if (Array.isArray(value)) {
    return `${value.length} items`;
  }

  if (typeof value === "object") {
    const keys = Object.keys(value as Record<string, unknown>);
    return keys.slice(0, 6).join(", ") || "object";
  }

  return String(value).slice(0, 120);
}
