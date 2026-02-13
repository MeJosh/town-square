<template>
  <div
    class="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
  >
    <!-- Character Icon -->
    <div class="flex-shrink-0">
      <img
        :src="characterIcon"
        :alt="`${character.name} icon`"
        class="h-12 w-12 rounded-full border-2 border-gray-300 bg-gray-100 object-cover dark:border-gray-600 dark:bg-gray-700"
        loading="lazy"
      />
    </div>

    <!-- Character Info -->
    <div class="min-w-0 flex-1">
      <h3
        class="text-lg font-semibold text-gray-900 dark:text-gray-100"
        :class="getSectionColor(character.characterType)"
      >
        {{ character.name }}
      </h3>
      <p class="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        {{ character.ability || 'No ability description available.' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Character {
  name: string;
  slug: string;
  characterType?: string | null;
  edition?: string | null;
  ability?: string | null;
  iconPath?: string | null;
  sourceUrl?: string | null;
}

interface Props {
  character: Character;
}

const props = defineProps<Props>();

const FISHERMAN_API_BASE = import.meta.env.PUBLIC_FISHERMAN_API_URL || 'http://localhost/fisherman/api';

const characterIcon = computed(() => {
  if (props.character.iconPath) {
    // iconPath is stored as "assets/filename.png", so we need to remove "assets/" prefix
    // since the API endpoint is already /assets/
    let cleanPath = props.character.iconPath;
    if (cleanPath.startsWith('assets/')) {
      cleanPath = cleanPath.substring('assets/'.length);
    }
    return `${FISHERMAN_API_BASE}/assets/${cleanPath}`;
  }
  return 'https://wiki.bloodontheclocktower.com/images/2/26/Icon_amnesiac.png';
});

const getSectionColor = (characterType?: string | null) => {
  if (!characterType) return 'text-gray-600';

  const type = characterType.toLowerCase();
  const colors = {
    townsfolk: 'text-blue-600 dark:text-blue-400',
    outsider: 'text-cyan-600 dark:text-cyan-400',
    minion: 'text-orange-600 dark:text-orange-400',
    demon: 'text-red-600 dark:text-red-400',
  };
  return colors[type as keyof typeof colors] || 'text-gray-600';
};
</script>
