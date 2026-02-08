<template>
  <button
    @click="toggleTheme"
    class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm transition-colors duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
    :title="`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`"
  >
    <Sun v-if="currentTheme === 'dark'" class="h-4 w-4" />
    <Moon v-else class="h-4 w-4" />
    <span class="sr-only">Toggle theme</span>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Sun, Moon } from 'lucide-vue-next';

const currentTheme = ref<'light' | 'dark'>('light');

const toggleTheme = () => {
  const newTheme = currentTheme.value === 'dark' ? 'light' : 'dark';
  currentTheme.value = newTheme;

  // Update localStorage
  localStorage.setItem('theme', newTheme);

  // Update document class
  if (newTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

onMounted(() => {
  // Get initial theme from DOM state (which was set by the inline script)
  const isDarkMode = document.documentElement.classList.contains('dark');
  currentTheme.value = isDarkMode ? 'dark' : 'light';
});
</script>
