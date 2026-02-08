FROM oven/bun:1.2.4

WORKDIR /app

RUN apt-get update \
	&& apt-get install -y git \
	&& rm -rf /var/lib/apt/lists/*

COPY package.json bun.lock ./
RUN bun install

COPY . .

ARG PUBLIC_API_URL=http://localhost:3001
ARG PUBLIC_API_BASE_URL=http://localhost:3001/api
ENV PUBLIC_API_URL=$PUBLIC_API_URL
ENV PUBLIC_API_BASE_URL=$PUBLIC_API_BASE_URL

RUN bun run build

EXPOSE 4321

CMD ["bun", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4321"]
