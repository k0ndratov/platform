# ---- Stage 1: build the Vue client ----
FROM node:24-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY shared/ /app/shared/
COPY client/ ./
RUN npm run build

# ---- Stage 2: the Express server, serving the built client ----
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev
COPY server/ ./server/
COPY shared/ ./shared/
COPY --from=client-build /app/client/dist ./client/dist

# The SQLite file lives here. Mount a volume to keep data between restarts.
RUN mkdir -p /app/server/data
VOLUME ["/app/server/data"]

ENV PORT=3000
ENV CLIENT_DIST=/app/client/dist
EXPOSE 3000
CMD ["node", "server/src/index.js"]
