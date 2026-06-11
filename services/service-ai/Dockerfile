FROM node:20-alpine AS builder
LABEL org.opencontainers.image.authors="Francisco Stanley Rodrigues Albuquerque"
WORKDIR /app

ENV HUSKY=0 CI=true
RUN apk add --no-cache libc6-compat

COPY package*.json ./
COPY packages ./packages
COPY services/service-ai ./services/service-ai

RUN npm install --workspace=service-ai --workspace=@myjarvis/shared --ignore-scripts

RUN npm run build -w @myjarvis/shared && npm run build -w service-ai

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/services/service-ai/dist ./dist
COPY --from=builder /app/services/service-ai/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3002
CMD ["node", "dist/main.js"]
