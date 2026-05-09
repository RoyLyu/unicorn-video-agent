import { createDbClient } from "./index";
import { createSchemaSql } from "./schema-ddl";

export function createTestDbClient() {
  const client = createDbClient(":memory:");
  client.sqlite.exec(createSchemaSql);

  return client;
}
