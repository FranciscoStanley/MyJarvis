FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/shared ./packages/shared
COPY services/service-ai ./services/service-ai
RUN npm install --workspace=service-ai --workspace=@myjarvis/shared
RUN npm run build -w @myjarvis/shared && npm run build -w service-ai
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/services/service-ai/dist ./dist
COPY --from=builder /app/services/service-ai/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3002
CMD ["node", "dist/main.js"]
