<template>
  <div class="space-y-4">
    <!-- Section Header -->
    <div class="border-b border-gray-200 pb-2 dark:border-gray-700">
      <h2
        class="text-xl font-bold uppercase tracking-wide"
        :class="getSectionHeaderColor(sectionType)"
      >
        {{ sectionTitle }}
      </h2>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        {{ characters.length }} character{{
          characters.length === 1 ? '' : 's'
        }}
      </p>
    </div>

    <!-- Character Grid -->
    <div class="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
      <CharacterCard
        v-for="character in characters"
        :key="character.id"
        :character="character"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import CharacterCard from './CharacterCard.vue';

interface Character {
  id: string;
  name: string;
  description: string;
  icon: string;
  section: 'townsfolk' | 'outsiders' | 'minions' | 'demons';
}

interface Props {
  sectionType: 'townsfolk' | 'outsiders' | 'minions' | 'demons';
  characters: Character[];
}

const props = defineProps<Props>();

const sectionTitle = computed(() => {
  const titles = {
    townsfolk: 'Townsfolk',
    outsiders: 'Outsiders',
    minions: 'Minions',
    demons: 'Demons',
  };
  return titles[props.sectionType];
});

const getSectionHeaderColor = (section: string) => {
  const colors = {
    townsfolk: 'text-blue-700 dark:text-blue-300',
    outsiders: 'text-orange-700 dark:text-orange-300',
    minions: 'text-red-700 dark:text-red-300',
    demons: 'text-purple-700 dark:text-purple-300',
  };
  return colors[section as keyof typeof colors] || 'text-gray-700';
};
</script>
