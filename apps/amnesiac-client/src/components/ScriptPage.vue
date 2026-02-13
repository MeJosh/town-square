<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950"
  >
    <!-- Main Content -->
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Script Header -->
      <div class="mb-8 text-center">
        <h1
          class="text-4xl font-bold text-gray-900 dark:text-gray-100 md:text-5xl"
        >
          {{ scriptName }}
        </h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          by {{ scriptAuthor }}
        </p>
        <div class="mt-4 flex justify-center">
          <div class="rounded-lg bg-red-100 px-4 py-2 dark:bg-red-900/30">
            <span class="text-sm font-medium text-red-800 dark:text-red-200">
              {{ totalCharacters }} Total Characters
            </span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-16">
        <div
          class="h-12 w-12 animate-spin rounded-full border-b-2 border-red-600"
        ></div>
        <span class="ml-3 text-gray-600 dark:text-gray-300"
          >Loading script...</span
        >
      </div>

      <!-- Error State -->
      <div v-if="!loading && error" class="mx-auto max-w-md">
        <div
          class="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20"
        >
          <div class="flex">
            <div class="text-red-800 dark:text-red-200">
              <h3 class="mb-2 font-medium">Failed to load script</h3>
              <p class="text-sm">{{ error }}</p>
            </div>
          </div>
          <button
            @click="fetchScript"
            class="mt-4 w-full rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>

      <!-- Script Sections -->
      <div v-if="!loading && !error" class="space-y-12">
        <!-- Townsfolk Section -->
        <ScriptSection
          v-if="townsfolk.length > 0"
          section-type="townsfolk"
          :characters="townsfolk"
        />

        <!-- Outsiders Section -->
        <ScriptSection
          v-if="outsiders.length > 0"
          section-type="outsiders"
          :characters="outsiders"
        />

        <!-- Minions Section -->
        <ScriptSection
          v-if="minions.length > 0"
          section-type="minions"
          :characters="minions"
        />

        <!-- Demons Section -->
        <ScriptSection
          v-if="demons.length > 0"
          section-type="demons"
          :characters="demons"
        />

        <!-- Empty State -->
        <div v-if="totalCharacters === 0" class="py-16 text-center">
          <div class="mb-4 text-gray-400 dark:text-gray-500">
            <svg
              class="mx-auto h-16 w-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 class="mb-2 text-xl font-medium text-gray-900 dark:text-white">
            No characters found
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            The script appears to be empty or invalid.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import ScriptSection from './ScriptSection.vue';

interface Character {
  name: string;
  slug: string;
  characterType?: string | null;
  edition?: string | null;
  ability?: string | null;
  iconPath?: string | null;
  sourceUrl?: string | null;
}

interface SessionData {
  id: string;
  name: string;
  startTime: string;
  lastUpdated: string;
  type: string;
  state: Record<string, unknown>;
}

interface Props {
  sessionData?: SessionData | null;
}

const props = withDefaults(defineProps<Props>(), {
  sessionData: null,
});

// Reactive state
const loading = ref(true);
const error = ref<string | null>(null);
const scriptData = ref<unknown[]>([]);
const scriptName = ref('Unknown Script');
const scriptAuthor = ref('Unknown Author');

// Character arrays
const townsfolk = ref<Character[]>([]);
const outsiders = ref<Character[]>([]);
const minions = ref<Character[]>([]);
const demons = ref<Character[]>([]);

// Computed properties
const totalCharacters = computed(() => {
  return (
    townsfolk.value.length +
    outsiders.value.length +
    minions.value.length +
    demons.value.length
  );
});

// API configuration
const FISHERMAN_API_BASE = import.meta.env.PUBLIC_FISHERMAN_API_URL || 'http://localhost/fisherman/api';

// Helper function to fetch character data from Fisherman API
const fetchCharacterData = async (slug: string): Promise<Character | null> => {
  try {
    const response = await fetch(`${FISHERMAN_API_BASE}/characters/${slug}`);
    if (!response.ok) {
      console.warn(`Character not found: ${slug}`);
      return null;
    }
    return await response.json();
  } catch (err) {
    console.error(`Failed to fetch character ${slug}:`, err);
    return null;
  }
};

// Process script data into character sections
const processScriptData = async (data: unknown[]) => {
  if (!Array.isArray(data) || data.length === 0) return;

  // Extract meta information
  const scriptMeta = data.find((item: unknown) => {
    const obj = item as Record<string, unknown>;
    return obj?.id === '_meta';
  }) as Record<string, unknown> | undefined;

  scriptName.value = (scriptMeta?.name as string) || 'Unknown Script';
  scriptAuthor.value = (scriptMeta?.author as string) || 'Unknown Author';

  // Clear existing character arrays
  townsfolk.value = [];
  outsiders.value = [];
  minions.value = [];
  demons.value = [];

  // Get character slugs (filter out meta and non-string items)
  const characterSlugs = data.filter(
    (item: unknown) => typeof item === 'string'
  ) as string[];

  // Fetch character data from Fisherman API
  const characterPromises = characterSlugs.map((slug) =>
    fetchCharacterData(slug)
  );
  const characters = (await Promise.all(characterPromises)).filter(
    (char): char is Character => char !== null
  );

  // Organize characters by type
  characters.forEach((character) => {
    const type = character.characterType?.toLowerCase();
    if (type === 'townsfolk') {
      townsfolk.value.push(character);
    } else if (type === 'outsider') {
      outsiders.value.push(character);
    } else if (type === 'minion') {
      minions.value.push(character);
    } else if (type === 'demon') {
      demons.value.push(character);
    }
  });
};

// Fetch script data
const fetchScript = async () => {
  loading.value = true;
  error.value = null;

  try {
    const scriptUrl =
      'https://raw.githubusercontent.com/AbstractDevs/librarian/refs/heads/main/src/data/scripts/rotting-moors/latest.json';
    const response = await fetch(scriptUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch script: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    scriptData.value = data;
    await processScriptData(data);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Failed to fetch script data:', err);
  } finally {
    loading.value = false;
  }
};

// Load script on component mount
onMounted(() => {
  if (props.sessionData) {
    // If session data is provided, use it to determine script behavior
    // For now, we'll still fetch the script normally, but we could extend this
    // to use session state in the future
    scriptName.value = props.sessionData.name;
    // TODO: Eventually use session state to determine script data
  }
  fetchScript();
});
</script>
