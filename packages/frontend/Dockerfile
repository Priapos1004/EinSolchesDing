FROM oven/bun:1 AS build
WORKDIR /app

# Copy workspace root
COPY package.json ./

# Copy package.json for all workspaces (bun requires all to be present)
COPY packages/frontend/package.json packages/frontend/
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/

# Install dependencies
RUN bun install

# Copy source code
COPY packages/frontend/ packages/frontend/
COPY packages/shared/ packages/shared/

# Build
RUN cd packages/frontend && bun run build

# Serve with nginx
FROM nginx:alpine
COPY --from=build /app/packages/frontend/dist /usr/share/nginx/html
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
