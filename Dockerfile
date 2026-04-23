FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache python3 make g++ sqlite

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline --no-audit

FROM deps AS build
COPY . .
RUN npm run build
# Ensure database directory exists
RUN mkdir -p /data

FROM node:20-alpine AS production
WORKDIR /app
RUN apk add --no-cache sqlite
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
