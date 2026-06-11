FROM node:20-alpine AS builder
LABEL org.opencontainers.image.authors="Francisco Stanley Rodrigues Albuquerque"
WORKDIR /app
COPY package*.json ./
COPY packages/shared ./packages/shared
COPY frontends/jarvis-web ./frontends/jarvis-web
RUN npm install --workspace=jarvis-web --workspace=@myjarvis/shared
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build -w jarvis-web
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/frontends/jarvis-web/.next/standalone ./
COPY --from=builder /app/frontends/jarvis-web/.next/static ./frontends/jarvis-web/.next/static
COPY --from=builder /app/frontends/jarvis-web/public ./frontends/jarvis-web/public
EXPOSE 3100
ENV PORT=3100
CMD ["node", "frontends/jarvis-web/server.js"]
