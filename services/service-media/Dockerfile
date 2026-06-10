FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/shared ./packages/shared
COPY services/service-media ./services/service-media
RUN npm install --workspace=service-media --workspace=@myjarvis/shared
RUN npm run build -w @myjarvis/shared && npm run build -w service-media
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/services/service-media/dist ./dist
COPY --from=builder /app/services/service-media/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3006
CMD ["node", "dist/main.js"]
