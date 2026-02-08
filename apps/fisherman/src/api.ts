import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { ScrapeProgress } from "./scraper";
import { DEFAULT_CATEGORIES, scrapeCharacters } from "./scraper";
import { cleanData, loadCharacters } from "./storage";

const ROOT_DIR = fileURLToPath(new URL("..", import.meta.url));
const DATA_DIR = join(ROOT_DIR, "data");

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function notFound(message: string): Response {
  return jsonResponse({ detail: message }, 404);
}

function parseCategories(query: string | null): string[] {
  if (!query) {
    return DEFAULT_CATEGORIES;
  }
  const categories = query
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return categories.length ? categories : DEFAULT_CATEGORIES;
}

function contentTypeForPath(pathname: string): string {
  const extension = extname(pathname).toLowerCase();
  if (extension === ".svg") return "image/svg+xml";
  if (extension === ".png") return "image/png";
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  return "application/octet-stream";
}

const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Blood on the Clocktower API",
    version: "1.0.0",
  },
  servers: [{ url: "http://localhost:3000" }],
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": { description: "OK" },
        },
      },
    },
    "/characters": {
      get: {
        summary: "List characters",
        parameters: [
          {
            name: "type",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
          {
            name: "edition",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Character list" },
        },
      },
    },
    "/characters/{slug}": {
      get: {
        summary: "Get character by slug",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Character" },
          "404": { description: "Not found" },
        },
      },
    },
    "/assets/{filename}": {
      get: {
        summary: "Get character asset",
        parameters: [
          {
            name: "filename",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Asset file" },
          "404": { description: "Not found" },
        },
      },
    },
    "/scrape": {
      post: {
        summary: "Scrape character data",
        parameters: [
          {
            name: "categories",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Scrape completed" },
          "202": { description: "Scrape started" },
          "409": { description: "Scrape already running" },
        },
      },
    },
    "/scrape/status": {
      get: {
        summary: "Get scrape job status",
        responses: {
          "200": { description: "Status" },
        },
      },
    },
    "/clean": {
      post: {
        summary: "Remove character data and assets",
        responses: {
          "200": { description: "Clean completed" },
        },
      },
    },
  },
};

const swaggerHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>API Docs</title>
    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css"
    />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/openapi.json",
        dom_id: "#swagger-ui",
      });
    </script>
  </body>
</html>`;

type ScrapeJob = {
  id: number;
  categories: string[];
  status: "running" | "completed" | "failed";
  startedAt: string;
  finishedAt?: string;
  total?: number;
  processed?: number;
  lastTitle?: string;
  error?: string;
};

let activeScrape: ScrapeJob | null = null;
let scrapeCounter = 0;

function startScrape(categories: string[]): ScrapeJob {
  scrapeCounter += 1;
  const job: ScrapeJob = {
    id: scrapeCounter,
    categories,
    status: "running",
    startedAt: new Date().toISOString(),
    total: undefined,
    processed: 0,
    lastTitle: undefined,
  };
  activeScrape = job;

  const onProgress = (progress: ScrapeProgress) => {
    job.total = progress.total;
    job.processed = progress.processed;
    job.lastTitle = progress.title;
  };

  void scrapeCharacters(DATA_DIR, categories, {
    onStart: (total) => {
      job.total = total;
    },
    onProgress,
  })
    .then(() => {
      job.status = "completed";
      job.finishedAt = new Date().toISOString();
    })
    .catch((error) => {
      job.status = "failed";
      job.finishedAt = new Date().toISOString();
      job.error = error instanceof Error ? error.message : String(error);
    });

  return job;
}

const server = Bun.serve({
  port: 3000,
  fetch: async (request) => {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (pathname === "/health") {
      return jsonResponse({ status: "ok" });
    }

    if (pathname === "/openapi.json") {
      return jsonResponse(openApiSpec);
    }

    if (pathname === "/docs") {
      return new Response(swaggerHtml, {
        status: 200,
        headers: { "content-type": "text/html" },
      });
    }

    if (pathname === "/scrape" && request.method === "POST") {
      const categories = parseCategories(url.searchParams.get("categories"));
      if (activeScrape && activeScrape.status === "running") {
        return jsonResponse({ detail: "Scrape already running", job: activeScrape }, 409);
      }
      const job = startScrape(categories);
      return jsonResponse({ status: "started", job }, 202);
    }

    if (pathname === "/scrape/status") {
      return jsonResponse({ job: activeScrape });
    }

    if (pathname === "/clean" && request.method === "POST") {
      await cleanData(DATA_DIR);
      return jsonResponse({ status: "ok" });
    }

    if (pathname.startsWith("/assets/")) {
      const relativePath = pathname.replace("/assets/", "");
      const filePath = join(DATA_DIR, "assets", relativePath);
      if (!existsSync(filePath)) {
        return notFound("Asset not found");
      }
      const data = await readFile(filePath);
      return new Response(data, {
        status: 200,
        headers: { "content-type": contentTypeForPath(filePath) },
      });
    }

    if (pathname === "/characters") {
      const characters = await loadCharacters(DATA_DIR);
      const typeFilter = url.searchParams.get("type");
      const editionFilter = url.searchParams.get("edition");
      const filtered = characters.filter((character) => {
        if (typeFilter && (character.characterType ?? "").toLowerCase() !== typeFilter.toLowerCase()) {
          return false;
        }
        if (editionFilter && (character.edition ?? "").toLowerCase() !== editionFilter.toLowerCase()) {
          return false;
        }
        return true;
      });
      return jsonResponse(filtered);
    }

    if (pathname.startsWith("/characters/")) {
      const slug = pathname.replace("/characters/", "");
      const characters = await loadCharacters(DATA_DIR);
      const character = characters.find((entry) => entry.slug === slug);
      if (!character) {
        return notFound("Character not found");
      }
      return jsonResponse(character);
    }

    return notFound("Route not found");
  },
});

console.log(`API listening on http://localhost:${server.port}`);
