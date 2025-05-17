## Remote MCP Tools (with Claude Desktop)

Install the dependencies:

```bash
npm install
```

Start your MCP server with:

```bash
npm run start
```

Your server will be running at `http://localhost:3000/sse`.

## Connecting to Claude Desktop

To connect your tool to Claude Desktop:

1. Open Claude Desktop.
2. Go to Settings > Developer > Edit Config.
3. Add your MCP server to the configuration using `mcp-proxy`:

```json
{
  "mcpServers": {
    "counting": {
      "command": "mcp-proxy",
      "args": [
        "http://localhost:3000/sse"
      ]
    }
  }
}
```

> **NOTE:** `mcp-proxy` ([repo](https://github.com/sparfenyuk/mcp-proxy)) enables Claude Desktop (which currently supports only the `stdio` transport of the MCP spec) to connect to your MCP Server via `HTTP+SSE` protocol by translating between the two. Ensure `mcp-proxy` is installed and accessible in your system's PATH.

Restart Claude Desktop, and your tool will be available.

### Testing It Out

Now you can ask Claude: "How many 'R's are in 'strawberry'?"

Claude should use your counting tool to provide the correct answer.

![Strawberry response with Tools](./imgs/strawberry-with-tools.png)
