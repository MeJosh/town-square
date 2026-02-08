FROM oven/bun:1.2.4

WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --production

COPY src ./src
COPY data ./data

EXPOSE 3000

CMD ["bun", "run", "start"]
