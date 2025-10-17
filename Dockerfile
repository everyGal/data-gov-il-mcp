# Use Node 18 as the repo expects Node 18+
FROM node:18-alpine

WORKDIR /app

# Only copy the manifest first for layer caching
COPY package*.json ./

# If there is no package-lock.json, npm ci will fail.
# Try npm ci first (if lockfile gets added later), then fall back to npm install.
RUN npm ci --omit=dev || npm install --omit=dev

# Now copy the rest of the app
COPY . .

ENV NODE_ENV=production
# The server likely respects PORT - default to 3000
ENV PORT=3000

# Expose the HTTP server
EXPOSE 3000

# Start the HTTP/SSE MCP server (repo contains http-server.js)
CMD ["node", "http-server.js"]
