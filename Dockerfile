FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build


FROM node:22-alpine AS production

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/resources ./resources
COPY --from=builder /app/.env.example ./.env.example
COPY package.json ./

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "build/src/index.js"]