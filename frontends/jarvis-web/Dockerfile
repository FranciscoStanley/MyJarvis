FROM node:20-alpine AS builder
LABEL org.opencontainers.image.authors="Francisco Stanley Rodrigues Albuquerque"
WORKDIR /app

ENV HUSKY=0 CI=true
RUN apk add --no-cache libc6-compat

COPY package*.json ./
COPY packages ./packages
COPY frontends/jarvis-web ./frontends/jarvis-web

RUN npm install --workspace=jarvis-web --workspace=@myjarvis/shared --ignore-scripts

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
