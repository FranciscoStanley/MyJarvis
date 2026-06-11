FROM node:20-alpine AS builder
LABEL org.opencontainers.image.authors="Francisco Stanley Rodrigues Albuquerque"
WORKDIR /app

ENV HUSKY=0 CI=true
RUN apk add --no-cache libc6-compat

COPY package*.json ./
COPY packages ./packages
COPY services/service-gateway ./services/service-gateway

RUN npm install \
  --workspace=service-gateway \
  --workspace=@myjarvis/shared \
  --workspace=@myjarvis/nest-auth \
  --workspace=@myjarvis/nest-security \
  --ignore-scripts

RUN npm run build -w @myjarvis/shared \
  && npm run build -w @myjarvis/nest-auth \
  && npm run build -w @myjarvis/nest-security \
  && npm run build -w service-gateway

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/services/service-gateway/dist ./dist
COPY --from=builder /app/services/service-gateway/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
EXPOSE 3000
CMD ["node", "dist/main.js"]
