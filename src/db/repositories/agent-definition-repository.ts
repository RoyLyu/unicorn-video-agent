import { eq } from "drizzle-orm";

import { getDbClient, type DbClient } from "../index";
import { agentDefinitions as agentDefinitionsTable, type AgentDefinitionRow } from "../schema";
import {
  agentDefinitions,
  agentDefinitionBySlug
} from "@/lib/agents/agent-definitions";
import type { AgentDefinition, AgentSlug } from "@/lib/agents/agent-run-types";

export function syncAgentDefinitions(client: DbClient = getDbClient()) {
  const updatedAt = new Date().toISOString();

  for (const agent of agentDefinitions) {
    client.db
      .insert(agentDefinitionsTable)
      .values({
        slug: agent.slug,
        name: agent.name,
        role: agent.role,
        description: agent.description,
        requiredContextJson: JSON.stringify(agent.requiredContext),
        inputSchemaSummary: agent.inputSchemaSummary,
        outputSchemaSummary: agent.outputSchemaSummary,
        currentMode: agent.currentMode,
        futureMode: agent.futureMode,
        qaChecklistJson: JSON.stringify(agent.qaChecklist),
        updatedAt
      })
      .onConflictDoUpdate({
        target: agentDefinitionsTable.slug,
        set: {
          name: agent.name,
          role: agent.role,
          description: agent.description,
          requiredContextJson: JSON.stringify(agent.requiredContext),
          inputSchemaSummary: agent.inputSchemaSummary,
          outputSchemaSummary: agent.outputSchemaSummary,
          currentMode: agent.currentMode,
          futureMode: agent.futureMode,
          qaChecklistJson: JSON.stringify(agent.qaChecklist),
          updatedAt
        }
      })
      .run();
  }

  return listAgentDefinitions(client);
}

export function listAgentDefinitions(client?: DbClient): AgentDefinition[] {
  if (!client) {
    return agentDefinitions;
  }

  const rows = client.db.select().from(agentDefinitionsTable).all();

  return rows.length > 0 ? rows.map(toAgentDefinition) : agentDefinitions;
}

export function getAgentDefinitionBySlug(
  slug: string,
  client?: DbClient
): AgentDefinition | null {
  if (!client) {
    return agentDefinitionBySlug.get(slug as AgentSlug) ?? null;
  }

  const row = client.db
    .select()
    .from(agentDefinitionsTable)
    .where(eq(agentDefinitionsTable.slug, slug))
    .get();

  return row ? toAgentDefinition(row) : agentDefinitionBySlug.get(slug as AgentSlug) ?? null;
}

function toAgentDefinition(row: AgentDefinitionRow): AgentDefinition {
  return {
    slug: row.slug as AgentSlug,
    name: row.name,
    role: row.role,
    description: row.description,
    requiredContext: JSON.parse(row.requiredContextJson) as string[],
    inputSchemaSummary: row.inputSchemaSummary,
    outputSchemaSummary: row.outputSchemaSummary,
    currentMode: "mock",
    futureMode: "real_ai_pending",
    qaChecklist: JSON.parse(row.qaChecklistJson) as string[]
  };
}
