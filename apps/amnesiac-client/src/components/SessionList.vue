<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950"
  >
    <main class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <h1
          class="text-4xl font-bold text-gray-900 dark:text-gray-100 md:text-5xl"
        >
          Select a Session
        </h1>
        <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">
          Choose a Blood on the Clocktower session to view
        </p>
      </div>

      <!-- Sessions List -->
      <div class="space-y-4">
        <div
          v-for="session in sessions"
          :key="session.id"
          @click="navigateToSession(session.id)"
          class="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:border-red-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-red-600"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                {{ session.name }}
              </h3>
              <div
                class="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400"
              >
                <span>Created {{ formatDate(session.startTime) }}</span>
                <span
                  class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {{ session.type }}
                </span>
              </div>
            </div>
            <div class="ml-4">
              <svg
                class="h-6 w-6 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State (if somehow no sessions but this component is shown) -->
      <div v-if="sessions.length === 0" class="py-16 text-center">
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
          No sessions available
        </h3>
        <p class="text-gray-500 dark:text-gray-400">
          Please wait for an admin to create a session.
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
interface Session {
  id: string;
  name: string;
  startTime: string;
  lastUpdated: string;
  type: string;
  state: Record<string, unknown>;
}

interface Props {
  sessions: Session[];
}

defineProps<Props>();

// Navigation function
const navigateToSession = (sessionId: string) => {
  const baseUrl = import.meta.env.BASE_URL || '';
  const url = `${baseUrl}/sessions/${sessionId}`;
  window.location.href = url;
};

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
</script>
