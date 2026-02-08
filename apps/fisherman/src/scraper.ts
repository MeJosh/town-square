import { mkdir, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import * as cheerio from "cheerio";

import type { Character } from "./models";
import { saveCharacterList } from "./storage";

const WIKI_BASE_URL = "https://wiki.bloodontheclocktower.com";
const API_URL = `${WIKI_BASE_URL}/api.php`;
export const DEFAULT_CATEGORIES = [
  "Townsfolk",
  "Outsiders",
  "Minions",
  "Demons",
  "Travellers",
  "Fabled",
  "Loric",
];

type CategoryMember = {
  title?: string;
};

export type ScrapeProgress = {
  total: number;
  processed: number;
  title?: string;
};

export type ScrapeOptions = {
  onStart?: (total: number) => void;
  onProgress?: (progress: ScrapeProgress) => void;
};

function slugify(value: string): string {
  const lowered = value.toLowerCase().trim();
  const cleaned = lowered.replace(/[^a-z0-9]+/g, "-");
  return cleaned.replace(/^-+|-+$/g, "") || "character";
}

async function fetchCategoryMembers(category: string): Promise<CategoryMember[]> {
  const members: CategoryMember[] = [];
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    list: "categorymembers",
    cmtitle: `Category:${category}`,
    cmlimit: "500",
    origin: "*",
  });

  while (true) {
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      headers: { "User-Agent": "FishermanBot/1.0" },
    });
    if (!response.ok) {
      throw new Error(`Category fetch failed: ${response.status}`);
    }
    const payload = (await response.json()) as {
      query?: { categorymembers?: CategoryMember[] };
      continue?: Record<string, string>;
    };

    members.push(...(payload.query?.categorymembers ?? []));
    if (!payload.continue) {
      break;
    }
    for (const [key, value] of Object.entries(payload.continue)) {
      params.set(key, value);
    }
  }

  return members;
}

async function fetchPageHtml(title: string): Promise<string> {
  const params = new URLSearchParams({
    action: "parse",
    page: title,
    format: "json",
    prop: "text",
    origin: "*",
  });
  const response = await fetch(`${API_URL}?${params.toString()}`, {
    headers: { "User-Agent": "FishermanBot/1.0" },
  });
  if (!response.ok) {
    throw new Error(`Page fetch failed for ${title}: ${response.status}`);
  }
  const payload = (await response.json()) as {
    parse?: { text?: { "*"?: string } };
  };
  return payload.parse?.text?.["*"] ?? "";
}

function extractInfoboxValue($: cheerio.CheerioAPI, label: string): string | null {
  const normalized = label.toLowerCase();
  const headers = $("table.infobox th, .pi-data .pi-data-label");
  for (const element of headers.toArray()) {
    const text = $(element).text().trim().toLowerCase();
    if (text !== normalized) {
      continue;
    }
    const row = $(element).closest("tr");
    const cell = row.find("td").first();
    if (cell.length) {
      return cell.text().trim();
    }
    const sibling = $(element).next(".pi-data-value");
    if (sibling.length) {
      return sibling.text().trim();
    }
  }

  const infoRows = $("#character-details table tr");
  for (const row of infoRows.toArray()) {
    const cells = $(row).find("td");
    if (cells.length < 2) {
      continue;
    }
    const header = $(cells[0]).text().trim().toLowerCase();
    if (header !== normalized) {
      continue;
    }
    return $(cells[1]).text().trim();
  }
  return null;
}

function resolveUrl(url: string): string {
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  if (url.startsWith("/")) {
    return `${WIKI_BASE_URL}${url}`;
  }
  return url;
}

function extractIconUrl($: cheerio.CheerioAPI): string | null {
  const selectors = ["#character-details img", "table.infobox img", ".pi-image img", "figure img"];
  for (const selector of selectors) {
    const element = $(selector).first();
    const src = element.attr("src");
    if (src) {
      return resolveUrl(src);
    }
  }
  return null;
}

function extractAbilityText($: cheerio.CheerioAPI): string | null {
  const infoboxAbility = extractInfoboxValue($, "Ability");
  if (infoboxAbility) {
    return infoboxAbility;
  }

  const summaryHeader = $("h2 span.mw-headline#Summary, h3 span.mw-headline#Summary").first();
  if (summaryHeader.length) {
    const section = summaryHeader.closest("h2, h3");
    let node = section.next();
    while (node.length) {
      if (node.is("h2") || node.is("h3")) {
        break;
      }
      if (node.is("p")) {
        const text = node.text().trim();
        if (text) {
          const quoted = text.match(/"([^"]+)"/);
          return quoted ? quoted[1] : text;
        }
      }
      node = node.next();
    }
  }

  const headings = $("h2 span.mw-headline, h3 span.mw-headline");
  for (const element of headings.toArray()) {
    const text = $(element).text().trim().toLowerCase();
    if (text !== "ability") {
      continue;
    }
    const section = $(element).closest("h2, h3");
    const parts: string[] = [];
    let node = section.next();
    while (node.length) {
      if (node.is("h2") || node.is("h3")) {
        break;
      }
      if (node.is("p")) {
        parts.push(node.text().trim());
      }
      node = node.next();
    }
    if (parts.length) {
      return parts.join(" ");
    }
  }
  return null;
}

async function downloadIcon(iconUrl: string, assetsDir: string, slug: string): Promise<string | null> {
  const response = await fetch(iconUrl);
  if (!response.ok) {
    return null;
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  let extension = extname(new URL(iconUrl).pathname);
  if (!extension) {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("svg")) {
      extension = ".svg";
    } else if (contentType.includes("png")) {
      extension = ".png";
    } else if (contentType.includes("jpeg")) {
      extension = ".jpg";
    } else {
      extension = ".png";
    }
  }
  const filename = `${slug}${extension}`;
  const outputPath = join(assetsDir, filename);
  await writeFile(outputPath, buffer);
  return join("assets", basename(outputPath));
}

async function writeCharacter(dataDir: string, character: Character): Promise<void> {
  const outputDir = join(dataDir, "characters");
  await mkdir(outputDir, { recursive: true });
  const outputPath = join(outputDir, `${character.slug}.json`);
  await writeFile(outputPath, JSON.stringify(character, null, 2));
}

export async function scrapeCharacters(
  dataDir: string,
  categories: string[],
  options: ScrapeOptions = {},
): Promise<Character[]> {
  await mkdir(dataDir, { recursive: true });
  const assetsDir = join(dataDir, "assets");
  await mkdir(assetsDir, { recursive: true });

  const memberMap = new Map<string, { member: CategoryMember; category: string }>();
  for (const category of categories) {
    const members = await fetchCategoryMembers(category);
    if (!members.length) {
      console.warn(`No category members found for Category:${category}`);
      continue;
    }
    console.log(`Found ${members.length} category members in ${category}.`);
    for (const member of members) {
      if (member.title) {
        if (!memberMap.has(member.title)) {
          memberMap.set(member.title, { member, category });
        }
      }
    }
  }

  if (!memberMap.size) {
    throw new Error(`No category members found for ${categories.join(", ")}`);
  }
  const members = Array.from(memberMap.values());
  options.onStart?.(members.length);
  const characters: Character[] = [];
  let processed = 0;

  for (const entry of members) {
    const member = entry.member;
    if (!member.title) {
      continue;
    }
    const html = await fetchPageHtml(member.title);
    const $ = cheerio.load(html);
    const iconUrl = extractIconUrl($);
    const characterType = extractInfoboxValue($, "Type") ?? entry.category;
    const edition = extractInfoboxValue($, "Edition") ?? entry.category;
    const character: Character = {
      name: member.title,
      slug: slugify(member.title),
      characterType,
      edition,
      ability: extractAbilityText($),
      iconPath: null,
      sourceUrl: `${WIKI_BASE_URL}/wiki/${member.title.replace(/ /g, "_")}`,
    };

    if (iconUrl) {
      character.iconPath = await downloadIcon(iconUrl, assetsDir, character.slug);
    }

    await writeCharacter(dataDir, character);
    characters.push(character);
    processed += 1;
    options.onProgress?.({ total: members.length, processed, title: member.title });
  }

  await saveCharacterList(dataDir, characters);
  return characters;
}

function parseArgs(argv: string[]): { dataDir: string; categories: string[] } {
  const args = { dataDir: "data", categories: DEFAULT_CATEGORIES };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === "--data-dir" && argv[index + 1]) {
      args.dataDir = argv[index + 1];
      index += 1;
    } else if (value === "--category" && argv[index + 1]) {
      args.categories = [argv[index + 1]];
      index += 1;
    } else if (value === "--categories" && argv[index + 1]) {
      args.categories = argv[index + 1]
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean);
      index += 1;
    }
  }
  return args;
}

async function main(): Promise<void> {
  const { dataDir, categories } = parseArgs(process.argv.slice(2));
  await scrapeCharacters(dataDir, categories);
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
