FROM node:20-alpine AS builder
LABEL org.opencontainers.image.authors="Francisco Stanley Rodrigues Albuquerque"
WORKDIR /app

ENV HUSKY=0 CI=true
RUN apk add --no-cache libc6-compat

COPY package*.json ./
COPY packages ./packages
COPY services/service-voice ./services/service-voice

RUN npm install --workspace=service-voice --workspace=@myjarvis/shared --ignore-scripts

RUN npm run build -w @myjarvis/shared && npm run build -w service-voice

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/services/service-voice/dist ./dist
COPY --from=builder /app/services/service-voice/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3003
CMD ["node", "dist/main.js"]
