# Town Square

Monorepo for Blood on the Clocktower tooling.

## Apps

- Fisherman: Bun-based scraper and API for character data.
- Amnesiac Client: Astro PWA for session management.
- Amnesiac Server: Express server for sessions and APIs.

## Packages

- Amnesiac Shared: Shared types and utilities.

## Quick start

```bash
bun install
```

### Fisherman

```bash
cd apps/fisherman
bun run scrape
bun run start
```

### Amnesiac

```bash
bun run dev:amnesiac:all
```

## Docker

```bash
cd apps/fisherman
docker build -t fisherman .
docker run --rm -p 3000:3000 fisherman
```

## Docker Compose

```bash
docker compose up --build
```

## Docs

- Amnesiac details: [docs/amnesiac/README.md](docs/amnesiac/README.md)
