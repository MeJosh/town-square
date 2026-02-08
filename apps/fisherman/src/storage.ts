import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Character } from "./models";

export async function loadCharacters(dataDir: string): Promise<Character[]> {
  const charactersDir = join(dataDir, "characters");
  try {
    const entries = await readdir(charactersDir);
    const files = entries.filter((entry) => entry.endsWith(".json")).sort();
    const results: Character[] = [];
    for (const file of files) {
      const raw = await readFile(join(charactersDir, file), "utf-8");
      results.push(JSON.parse(raw) as Character);
    }
    return results;
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export async function saveCharacterList(dataDir: string, characters: Character[]): Promise<void> {
  const outputPath = join(dataDir, "characters.json");
  await writeFile(outputPath, JSON.stringify(characters, null, 2));
}

export async function cleanData(dataDir: string): Promise<void> {
  const charactersDir = join(dataDir, "characters");
  const assetsDir = join(dataDir, "assets");
  const listFile = join(dataDir, "characters.json");
  await rm(charactersDir, { recursive: true, force: true });
  await rm(assetsDir, { recursive: true, force: true });
  await rm(listFile, { force: true });
}
