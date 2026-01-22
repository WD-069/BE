import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "AIC MCP Server",
  version: "1.0.0",
});

// Add a search tool
server.registerTool(
  "search_artworks",
  {
    title: "Search Artworks",
    description: "Retrieve artworks based on a search query and a page number for pagination.",
    inputSchema: {
      query: z.string().describe("Search query for artworks"),
      page: z.number().int().min(1).default(1).describe("Page number for pagination"),
    },
  },
  async ({ query, page = 1 }) => {
    try {
      const size = 10;
      const from = (page - 1) * size;
      const baseUrl = "https://api.artic.edu/api/v1/artworks/search";
      const params = new URLSearchParams({
        q: query,
        size: size.toString(),
        from: from.toString(),
      });
      const response = await fetch(`${baseUrl}?${params}`);
      if (!response.ok)
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      const data = await response.json();
      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      };
    } catch (error: unknown) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
          },
        ],
        isError: true,
      };
    }
  },
);

// Add a documentation resource
server.registerResource(
  "documentation",
  new ResourceTemplate("docs://art-institute-of-chicago", { list: undefined }),
  {
    title: "Documentation AIC",
    description: "Returns full OpenAPI documentation for the Art Institute of Chicago API.",
  },
  async (uri) => {
    try {
      const res = await fetch("https://api.artic.edu/api/v1/openapi.json");

      if (!res.ok)
        throw new Error(`Failed to fetch documentation: ${res.status} ${res.statusText}`);

      const doc = await res.json();
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(doc, null, 2),
          },
        ],
      };
    } catch (error: unknown) {
      return {
        contents: [
          {
            uri: uri.href,
            text: `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
          },
        ],
      };
    }
  },
);

server.registerPrompt(
  "artwork_search_prompt",
  {
    title: "Artwork Search Prompt",
    description: "A prompt to search for artworks using a query and page number.",
    argsSchema: {
      query: z.string().describe("Search query for artworks"),
    },
  },
  async ({ query }) => ({
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Search for artworks related to: ${query}`,
        },
      },
    ],
  }),
);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
