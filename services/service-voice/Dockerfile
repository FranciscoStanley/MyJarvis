FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/shared ./packages/shared
COPY services/service-voice ./services/service-voice
RUN npm install --workspace=service-voice --workspace=@myjarvis/shared
RUN npm run build -w @myjarvis/shared && npm run build -w service-voice
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/services/service-voice/dist ./dist
COPY --from=builder /app/services/service-voice/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3003
CMD ["node", "dist/main.js"]
