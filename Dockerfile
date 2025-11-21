# Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./

# Next.js par défaut sur 3000 dans le conteneur
EXPOSE 3000

CMD ["npm", "start"]

