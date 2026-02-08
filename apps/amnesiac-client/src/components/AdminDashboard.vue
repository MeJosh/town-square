<template>
  <div class="space-y-8">
    <!-- Sessions Table Section -->
    <div class="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
          Active Sessions
        </h2>
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ sessionCount }} session{{ sessionCount !== 1 ? 's' : '' }}
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div
          class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"
        ></div>
        <span class="ml-3 text-gray-600 dark:text-gray-300"
          >Loading sessions...</span
        >
      </div>

      <!-- Error State -->
      <div
        v-if="!loading && error"
        class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20"
      >
        <div class="flex">
          <div class="text-red-800 dark:text-red-200">
            <p class="font-medium">Error loading sessions</p>
            <p class="text-sm">{{ error }}</p>
          </div>
          <button
            @click="fetchSessions"
            class="ml-auto rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>

      <!-- Sessions Table -->
      <div v-if="!loading && !error" class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
              >
                Name
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
              >
                Type
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
              >
                Created
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
              >
                Last Updated
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            class="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800"
          >
            <tr
              v-for="session in sessions"
              :key="session.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td class="whitespace-nowrap px-6 py-4">
                <div class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ session.name }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  ID: {{ session.id }}
                </div>
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                <span
                  class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {{ session.type }}
                </span>
              </td>
              <td
                class="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-300"
              >
                {{ formatDate(session.startTime) }}
              </td>
              <td
                class="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-300"
              >
                {{ formatDate(session.lastUpdated) }}
              </td>
              <td
                class="whitespace-nowrap px-6 py-4 text-right text-sm font-medium"
              >
                <button
                  @click="confirmDeleteSession(session)"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                  :disabled="loading"
                  title="Delete session"
                >
                  <svg
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="sessions.length === 0" class="py-12 text-center">
          <div class="mb-4 text-gray-400 dark:text-gray-500">
            <svg
              class="mx-auto h-12 w-12"
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
          <h3 class="mb-2 text-lg font-medium text-gray-900 dark:text-white">
            No sessions found
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            Create your first session using the form below.
          </p>
        </div>
      </div>
    </div>

    <!-- Create Session Form -->
    <div class="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
      <h2 class="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        Create New Session
      </h2>

      <form @submit.prevent="handleCreateSession" class="space-y-4">
        <div>
          <label
            for="session-name"
            class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Session Name
          </label>
          <input
            id="session-name"
            v-model="newSession.name"
            type="text"
            required
            class="w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            placeholder="Enter session name"
          />
        </div>

        <div>
          <label
            for="session-type"
            class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Session Type
          </label>
          <select
            id="session-type"
            v-model="newSession.type"
            class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="SCRIPT">SCRIPT</option>
          </select>
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="loading || !newSession.name.trim()"
            class="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              v-if="loading"
              class="-ml-1 mr-3 h-4 w-4 animate-spin text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            {{ loading ? 'Creating...' : 'Create Session' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600 bg-opacity-50"
      @click="closeDeleteModal"
    >
      <div
        class="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg dark:bg-gray-800"
        @click.stop
      >
        <div class="mt-3 text-center">
          <div
            class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20"
          >
            <svg
              class="h-6 w-6 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3
            class="mt-4 text-lg font-medium leading-6 text-gray-900 dark:text-white"
          >
            Delete Session
          </h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete the session "{{
                sessionToDelete?.name
              }}"? This action cannot be undone.
            </p>
          </div>
          <div class="items-center space-x-3 px-4 py-3">
            <button
              @click="closeDeleteModal"
              class="w-auto rounded-md bg-gray-500 px-4 py-2 text-base font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              @click="handleDeleteSession"
              :disabled="loading"
              class="w-auto rounded-md bg-red-600 px-4 py-2 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
            >
              {{ loading ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSessionStore } from '../stores/sessionStore';
import { storeToRefs } from 'pinia';

// Store setup
const sessionStore = useSessionStore();
const { sessions, loading, error, sessionCount } = storeToRefs(sessionStore);
const { fetchSessions, createSession, deleteSession } = sessionStore;

// Form state
const newSession = ref({
  name: '',
  type: 'SCRIPT',
});

// Modal state
const showDeleteModal = ref(false);
const sessionToDelete = ref<any>(null);

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return (
    date.toLocaleDateString() +
    ' ' +
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
};

// Handle form submission
const handleCreateSession = async () => {
  if (!newSession.value.name.trim()) return;

  const result = await createSession({
    name: newSession.value.name.trim(),
    type: newSession.value.type,
    state: {},
  });

  if (result) {
    // Reset form
    newSession.value.name = '';
    newSession.value.type = 'SCRIPT';
  }
};

// Handle delete confirmation
const confirmDeleteSession = (session: any) => {
  sessionToDelete.value = session;
  showDeleteModal.value = true;
};

const closeDeleteModal = () => {
  showDeleteModal.value = false;
  sessionToDelete.value = null;
};

const handleDeleteSession = async () => {
  if (!sessionToDelete.value) return;

  const success = await deleteSession(sessionToDelete.value.id);
  if (success) {
    closeDeleteModal();
  }
};

// Load sessions on mount
onMounted(() => {
  fetchSessions();
});
</script>
