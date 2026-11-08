FROM node:24-bookworm-slim AS build

WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN corepack pnpm install --frozen-lockfile
COPY . .
ENV RENDER_DEPLOY=1
RUN corepack pnpm run build:render

FROM node:24-bookworm-slim

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=10000 \
    RENDER_DEPLOY=1
WORKDIR /app
COPY --from=build --chown=node:node /app/dist/standalone ./
USER node
EXPOSE 10000
CMD ["node", "server.js"]
