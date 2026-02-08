<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950"
  >
    <template v-if="loading">
      <!-- Loading State -->
      <div class="flex min-h-screen items-center justify-center">
        <div class="text-center">
          <div
            class="mx-auto h-16 w-16 animate-spin rounded-full border-b-4 border-blue-600"
          ></div>
          <h2 class="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            Connecting to Server
          </h2>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Checking server health and loading sessions...
          </p>
          <div class="mt-4 text-sm text-gray-500 dark:text-gray-500">
            {{ loadingMessage }}
          </div>
        </div>
      </div>
    </template>

    <template v-if="!loading && showServerError">
      <!-- Error State -->
      <ServerErrorPage :errorMessage="serverError" />
    </template>

    <template v-if="!loading && !showServerError && sessionCount === 0">
      <!-- No Sessions -->
      <NoSessionsView />
    </template>

    <template v-if="!loading && !showServerError && sessionCount === 1">
      <!-- Single Session -->
      <ScriptPage :sessionData="sessions[0]" />
    </template>

    <template v-if="!loading && !showServerError && sessionCount > 1">
      <!-- Multiple Sessions -->
      <SessionList :sessions="sessions" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ServerErrorPage from './ServerErrorPage.vue';
import NoSessionsView from './NoSessionsView.vue';
import ScriptPage from './ScriptPage.vue';
import SessionList from './SessionList.vue';

interface Session {
  id: string;
  name: string;
  startTime: string;
  lastUpdated: string;
  type: string;
  state: Record<string, unknown>;
}

// Reactive state
const loading = ref(true);
const loadingMessage = ref('Initializing...');
const showServerError = ref(false);
const serverError = ref('');
const sessions = ref<Session[]>([]);
const sessionCount = ref(0);

// Get server URL based on environment
const getServerUrl = () => {
  return import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';
};

const getApiBaseUrl = () => {
  return import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
};

// Health check with timeout
const performHealthCheck = async (): Promise<boolean> => {
  try {
    loadingMessage.value = 'Checking server health...';
    const serverUrl = getServerUrl();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const healthResponse = await fetch(`${serverUrl}/health`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!healthResponse.ok) {
      serverError.value = `Server health check failed: ${healthResponse.status} ${healthResponse.statusText}`;
      return false;
    }

    loadingMessage.value = 'Server is healthy!';
    return true;
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        serverError.value = 'Server health check timed out (10 seconds)';
      } else {
        serverError.value = `Unable to connect to server: ${err.message}`;
      }
    } else {
      serverError.value = 'Unknown error during health check';
    }
    return false;
  }
};

// Fetch sessions
const fetchSessions = async (): Promise<Session[]> => {
  try {
    loadingMessage.value = 'Loading sessions...';
    const apiBaseUrl = getApiBaseUrl();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const sessionsResponse = await fetch(`${apiBaseUrl}/sessions`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (sessionsResponse.ok) {
      const result = await sessionsResponse.json();
      const sessionData = result.data || result || [];
      loadingMessage.value = `Found ${sessionData.length} session(s)`;
      return sessionData;
    } else {
      // If we can't fetch sessions but health check passed, treat as no sessions
      loadingMessage.value = 'No sessions available';
      return [];
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        serverError.value = 'Session loading timed out (10 seconds)';
      } else {
        console.warn('Failed to fetch sessions:', err.message);
        // Don't set server error here - this might just mean no sessions exist
        loadingMessage.value = 'Unable to load sessions';
      }
    }
    return [];
  }
};

// Main initialization function
const initialize = async () => {
  loading.value = true;
  showServerError.value = false;
  serverError.value = '';

  try {
    // Step 1: Check server health
    const isHealthy = await performHealthCheck();

    if (!isHealthy) {
      showServerError.value = true;
      return;
    }

    // Step 2: Fetch sessions
    const sessionData = await fetchSessions();
    sessions.value = sessionData;
    sessionCount.value = sessionData.length;

    // Small delay to show the final message
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (err) {
    showServerError.value = true;
    serverError.value =
      err instanceof Error
        ? err.message
        : 'Unexpected error during initialization';
  } finally {
    loading.value = false;
  }
};

// Initialize on component mount
onMounted(() => {
  initialize();
});
</script>
