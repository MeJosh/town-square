# Town Square

Monorepo for Blood on the Clocktower tooling.

## Apps

- Fisherman: Bun-based scraper and API for character data.

## Quick start

```bash
cd apps/fisherman
bun install
bun run scrape
bun run start
```

## Docker

```bash
cd apps/fisherman
docker build -t fisherman .
docker run --rm -p 3000:3000 fisherman
```
