#!/usr/bin/env node

import process from "node:process";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { server } from "./server.js";

async function start() {
  await server.connect(new StdioServerTransport());

  process.stderr.write(
    `Prettier MCP server is running. cwd: ${process.cwd()}.\n`,
  );
  process.on("SIGINT", disconnect);
  process.on("SIGTERM", disconnect);
}

function disconnect() {
  server.close();
}

// eslint-disable-next-line unicorn/prefer-top-level-await
start();
