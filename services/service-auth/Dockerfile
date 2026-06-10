FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY packages/shared ./packages/shared
COPY services/service-auth ./services/service-auth
RUN npm install --workspace=service-auth --workspace=@myjarvis/shared
RUN npm run build -w @myjarvis/shared && npm run build -w service-auth
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/services/service-auth/dist ./dist
COPY --from=builder /app/services/service-auth/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "dist/main.js"]
