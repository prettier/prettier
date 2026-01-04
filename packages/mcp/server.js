import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v3";
import * as prettier from "../../src/index.js";
import { formatFile } from "./format-file.js";

const server = new McpServer({
  name: "Prettier",
  version: prettier.version,
});

server.registerTool(
  "format-files",
  {
    title: "Format files",
    description:
      "Please provide a list of file urls to the files you want to format.",
    inputSchema: {
      files: z.array(z.string().min(1)).nonempty().describe("Files to format"),
    },
  },
  async ({ files }) => {
    const result = await Promise.all(files.map((file) => formatFile(file)));

    return {
      content: result.map((text) => ({ type: "text", text })),
    };
  },
);

export { server };
