FROM node:24.11.0-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/server/package.json apps/server/package.json
COPY apps/desktop/package.json apps/desktop/package.json
COPY packages/core/package.json packages/core/package.json
COPY packages/content/package.json packages/content/package.json
COPY packages/contracts/package.json packages/contracts/package.json
RUN ELECTRON_SKIP_BINARY_DOWNLOAD=1 npm ci
COPY . .
RUN npm run build && npm prune --omit=dev
FROM node:24.11.0-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production SERVER_PORT=3001 STATE_DB_PATH=/app/var/piko.sqlite
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/dist/server ./dist/server
COPY --from=build /app/apps/web/dist ./apps/web/dist
RUN mkdir -p /app/var && chown -R node:node /app/var
USER node
VOLUME ["/app/var"]
EXPOSE 3001
CMD ["node","dist/server/index.mjs"]
