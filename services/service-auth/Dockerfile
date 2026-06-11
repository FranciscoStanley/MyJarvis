FROM node:20-alpine AS builder
LABEL org.opencontainers.image.authors="Francisco Stanley Rodrigues Albuquerque"
WORKDIR /app

ENV HUSKY=0 CI=true
RUN apk add --no-cache libc6-compat python3 make g++

COPY package*.json ./
COPY packages ./packages
COPY services/service-auth ./services/service-auth

RUN npm install \
  --workspace=service-auth \
  --workspace=@myjarvis/shared \
  --workspace=@myjarvis/nest-auth \
  --workspace=@myjarvis/nest-security \
  --ignore-scripts

RUN npm rebuild bcrypt --workspace=service-auth

RUN npm run build -w @myjarvis/shared && npm run build -w service-auth

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/services/service-auth/dist ./dist
COPY --from=builder /app/services/service-auth/package.json ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "dist/main.js"]
