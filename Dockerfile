FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
# Build-only values validate configuration; runtime secrets are supplied by the host.
RUN MONGODB_URI=mongodb://localhost:27017/codenest \
    REDIS_URL=redis://localhost:6379 \
    NEXTAUTH_URL=http://localhost:3000 \
    NEXTAUTH_SECRET=build-only-nextauth-value-with-at-least-32-characters \
    INVITE_TOKEN_SECRET=build-only-invite-value-with-at-least-32-characters \
    npm run build \
    && npm prune --omit=dev \
    && rm -rf /app/.next/cache

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/server ./server
COPY --from=build --chown=node:node /app/src/lib/env-schema.js ./src/lib/env-schema.js
COPY --from=build --chown=node:node /app/server.js /app/next.config.js /app/package.json /app/tsconfig.json /app/tsconfig.build.json /app/LICENSE ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
