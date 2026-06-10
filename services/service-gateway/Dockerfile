FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/shared ./packages/shared
COPY services/service-gateway ./services/service-gateway
RUN npm install --workspace=service-gateway --workspace=@myjarvis/shared
RUN npm run build -w @myjarvis/shared
RUN npm run build -w service-gateway

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/services/service-gateway/dist ./dist
COPY --from=builder /app/services/service-gateway/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main.js"]
