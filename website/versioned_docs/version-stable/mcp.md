---
id: mcp
title: MCP Server
---

[Model Context Protocol](https://modelcontextprotocol.io) (MCP) is an open standard that enables AI models to interact with external tools and services through a unified interface. The [`@prettier/mcp`](https://www.npmjs.com/package/@prettier/mcp) package provides an MCP server that you can register with your code editor to allow LLMs to use Prettier directly.

## Set Up Prettier MCP Server in VS Code

To use MCP servers in VS Code, you must have the [Copilot Chat](https://code.visualstudio.com/docs/copilot/copilot-chat) extension installed. After that, follow these steps so add the Prettier MCP server:

### Create MCP Configuration File

Create a `.vscode/mcp.json` file in your project with the following configuration:

```jsonc title=".vscode/mcp.json"
{
  "servers": {
    "Prettier": {
      "type": "stdio",
      "command": "npx",
      "args": ["@prettier/mcp"],
    },
  },
}
```

Alternatively, you can use the Command Palette:

1. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS)
1. Type and select `MCP: Add Server`
1. Select `Command (stdio)` from the dropdown
1. Enter `npx @prettier/mcp` as the command
1. Type `Prettier` as the server ID
1. Choose `Workspace Settings` to create the configuration in `.vscode/mcp.json`

### Using the Prettier MCP Server with GitHub Copilot

Once your MCP server is configured, you can use it with [GitHub Copilot's agent mode](https://code.visualstudio.com/docs/copilot/chat/chat-agent-mode):

1. Open the Copilot Chat view in VS Code
1. Ensure agent mode is enabled (look for the agent icon in the chat input)
1. Toggle on the Prettier MCP server tools using the "Tools" button in the chat view
1. Ask Copilot to perform Prettier tasks, such as:
   - "Format this file."
   - "Is this file well formatted?"

## Troubleshooting

If you encounter issues with the Prettier MCP server:

1. Check the MCP server status by running `MCP: List Servers` from the Command Palette
1. Select the Prettier server and choose `Show Output` to view server logs
1. Ensure that Prettier is installed in your project
1. Verify that your MCP configuration is correct

## Additional Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/introduction)
- [VS Code MCP Servers Documentation](https://code.visualstudio.com/docs/copilot/chat/mcp-servers)
- [GitHub Copilot in VS Code Documentation](https://code.visualstudio.com/docs/copilot/copilot-chat)
