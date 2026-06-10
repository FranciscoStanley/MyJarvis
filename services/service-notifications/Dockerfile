FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/shared ./packages/shared
COPY services/service-notifications ./services/service-notifications
RUN npm install --workspace=service-notifications --workspace=@myjarvis/shared
RUN npm run build -w @myjarvis/shared && npm run build -w service-notifications
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/services/service-notifications/dist ./dist
COPY --from=builder /app/services/service-notifications/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3005
CMD ["node", "dist/main.js"]
