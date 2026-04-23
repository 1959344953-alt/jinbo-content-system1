FROM node:20-slim AS base
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++ sqlite3 libsqlite3-dev && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline --no-audit && npm rebuild better-sqlite3

FROM deps AS build
COPY . .
RUN npm run build
RUN mkdir -p /data

FROM node:20-slim AS production
WORKDIR /app
RUN apt-get update && apt-get install -y sqlite3 libsqlite3-dev && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/db ./db
COPY --from=build /app/api ./api
COPY --from=build /app/contracts ./contracts
COPY --from=build /app/index.html ./
COPY package.json .dockerignore drizzle.config.ts tsconfig.server.json vite.config.ts tailwind.config.js postcss.config.js ./
RUN mkdir -p /data
EXPOSE 3000
CMD ["npm", "start"]
