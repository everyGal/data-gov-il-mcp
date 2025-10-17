#!/usr/bin/env node

// This is a modified version that serves the MCP server over HTTP
// Place this file alongside your existing stdio.js

import express from 'express';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

// Import your existing server setup
// You'll need to export the server creation logic from stdio.js
// For now, this is a template showing the structure

const app = express();
const PORT = process.env.PORT || 3000;

// CORS middleware for remote access
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'data-gov-il-mcp' });
});

// SSE endpoint for MCP
app.get('/sse', async (req, res) => {
  console.log('New SSE connection established');
  
  const transport = new SSEServerTransport('/message', res);
  
  // Create your MCP server instance
  // You'll need to import and use your existing server setup here
  const server = new McpServer({
    name: 'data-gov-il',
    version: '1.0.0'
  });

  // Register all your tools here (from stdio.js)
  // server.tool(...);
  
  await server.connect(transport);
  
  req.on('close', () => {
    console.log('SSE connection closed');
  });
});

// POST endpoint for messages
app.post('/message', async (req, res) => {
  // Handle MCP messages
  res.json({ acknowledged: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`MCP Server listening on port ${PORT}`);
  console.log(`SSE endpoint: http://0.0.0.0:${PORT}/sse`);
});
