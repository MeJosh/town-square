<template>
  <div
    class="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
  >
    <!-- Character Icon -->
    <div class="flex-shrink-0">
      <img
        :src="character.icon"
        :alt="`${character.name} icon`"
        class="h-12 w-12 rounded-full border-2 border-gray-300 bg-gray-100 object-cover dark:border-gray-600 dark:bg-gray-700"
        loading="lazy"
      />
    </div>

    <!-- Character Info -->
    <div class="min-w-0 flex-1">
      <h3
        class="text-lg font-semibold text-gray-900 dark:text-gray-100"
        :class="getSectionColor(character.section)"
      >
        {{ character.name }}
      </h3>
      <p class="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
        {{ character.description }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Character {
  id: string;
  name: string;
  description: string;
  icon: string;
  section: 'townsfolk' | 'outsiders' | 'minions' | 'demons';
}

interface Props {
  character: Character;
}

defineProps<Props>();

const getSectionColor = (section: string) => {
  const colors = {
    townsfolk: 'text-blue-600 dark:text-blue-400',
    outsiders: 'text-orange-600 dark:text-orange-400',
    minions: 'text-red-600 dark:text-red-400',
    demons: 'text-purple-600 dark:text-purple-400',
  };
  return colors[section as keyof typeof colors] || 'text-gray-600';
};
</script>
