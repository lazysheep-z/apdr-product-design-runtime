/**
 * @file MCP smoke test — list projects and get_next_action without Cursor restart.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

/**
 * @param {string} projectId
 * @returns {Promise<void>}
 */
async function main() {
  const transport = new StdioClientTransport({
    command: "node",
    args: [path.join(root, "packages/mcp-servers/design-artifacts/dist/index.js")],
    env: {
      ...process.env,
      APDR_PROJECTS_ROOT: path.join(root, "projects"),
    },
  });

  const client = new Client({ name: "apdr-smoke", version: "1.0.0" });
  await client.connect(transport);

  const projects = await client.callTool({ name: "list_projects", arguments: {} });
  console.log("=== list_projects ===");
  console.log(projects.content?.[0]?.text ?? JSON.stringify(projects));

  const ids = ["demo", "conv-test"];
  for (const pid of ids) {
    const r = await client.callTool({
      name: "get_next_action",
      arguments: { project_id: pid, format: "json" },
    });
    const text = r.content?.[0]?.text ?? "";
    try {
      const j = JSON.parse(text);
      console.log(`\n=== ${pid}: ${j.stageTitleZh} (${j.stage}) phase=${j.phase} ===`);
      console.log("skillPath:", j.skillPath);
      console.log("blockers:", j.blockers.length ? j.blockers.join(", ") : "none");
    } catch {
      console.log(`\n=== ${pid} ===`, text.slice(0, 400));
    }
  }

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
