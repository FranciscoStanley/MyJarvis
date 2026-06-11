FROM node:20-alpine AS builder
LABEL org.opencontainers.image.authors="Francisco Stanley Rodrigues Albuquerque"
WORKDIR /app

ENV HUSKY=0 CI=true
RUN apk add --no-cache libc6-compat

COPY package*.json ./
COPY packages ./packages
COPY services/service-notifications ./services/service-notifications

RUN npm install --workspace=service-notifications --workspace=@myjarvis/shared --ignore-scripts

RUN npm run build -w @myjarvis/shared && npm run build -w service-notifications

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/services/service-notifications/dist ./dist
COPY --from=builder /app/services/service-notifications/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
EXPOSE 3005
CMD ["node", "dist/main.js"]
