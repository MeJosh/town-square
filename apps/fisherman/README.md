# Fisherman

Bun-based scraper and API for Blood on the Clocktower character data.

This app lives in `apps/fisherman` inside the Town Square monorepo. Run the commands below from this directory.

## Setup

```bash
bun install
```

## Scrape

```bash
bun run scrape
```

## Clean

```bash
bun run clean
```

## Run API

```bash
bun run start
```

## Dev server

```bash
bun run dev
```

## Docker

```bash
docker build -t fisherman .
docker run --rm -p 3000:3000 fisherman
```

## Endpoints

- `GET /health`
- `POST /scrape`
- `GET /scrape/status`
- `POST /clean`
- `GET /characters`
- `GET /characters/{slug}`
- `GET /assets/<filename>`
