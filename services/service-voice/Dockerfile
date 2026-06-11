FROM node:20-alpine AS builder
LABEL org.opencontainers.image.authors="Francisco Stanley Rodrigues Albuquerque"
WORKDIR /app

ENV HUSKY=0 CI=true
RUN apk add --no-cache libc6-compat

COPY package*.json ./
COPY packages ./packages
COPY services/service-voice ./services/service-voice

RUN set -e; \
  npm config set fetch-retries 5; \
  npm config set fetch-retry-mintimeout 20000; \
  npm config set fetch-retry-maxtimeout 120000; \
  npm config set maxsockets 2; \
  attempt=1; \
  while [ "$attempt" -le 5 ]; do \
    echo "npm install attempt ${attempt}/5..."; \
    if npm install --workspace=service-voice --workspace=@myjarvis/shared --ignore-scripts; then break; fi; \
    if [ "$attempt" -eq 5 ]; then exit 1; fi; \
    sleep $((attempt * 15)); \
    attempt=$((attempt + 1)); \
  done

RUN npm run build -w @myjarvis/shared && npm run build -w service-voice

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/services/service-voice/dist ./dist
COPY --from=builder /app/services/service-voice/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
EXPOSE 3003
CMD ["node", "dist/main.js"]
