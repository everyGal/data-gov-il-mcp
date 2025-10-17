#!/usr/bin/env node

import express from 'express';
import { spawn } from 'child_process';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'data-gov-il-mcp',
    version: '1.0.0'
  });
});

// Info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Israeli Government Open Data MCP Server',
    description: 'MCP server for accessing data.gov.il',
    repository: 'https://github.com/everyGal/data-gov-il-mcp',
    tools: [
      'list_available_tags',
      'search_tags',
      'find_datasets',
      'get_dataset_info',
      'search_records',
      'list_organizations',
      'list_all_datasets',
      'food_nutrition_analysis',
      'environmental_sustainability_analysis',
      'real_estate_market_analysis'
    ]
  });
});

// MCP endpoint - proxies to stdio.js
app.post('/mcp', async (req, res) => {
  const { method, params } = req.body;
  
  try {
    // Spawn the stdio MCP server as a subprocess
    const child = spawn('node', ['stdio.js']);
    
    let output = '';
    let errorOutput = '';
    
    // Send the request
    child.stdin.write(JSON.stringify({ method, params }) + '\n');
    child.stdin.end();
    
    // Collect output
    child.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    // Wait for completion
    child.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({ 
          error: 'MCP server error', 
          details: errorOutput 
        });
      }
      
      try {
        const result = JSON.parse(output);
        res.json(result);
      } catch (e) {
        res.json({ output });
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MCP HTTP Server running on port ${PORT}`);
  console.log(`📡 Endpoint: http://0.0.0.0:${PORT}/mcp`);
  console.log(`❤️  Health: http://0.0.0.0:${PORT}/health`);
});
