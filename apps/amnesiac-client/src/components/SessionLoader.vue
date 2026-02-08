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
            Loading Session
          </h2>
          <p class="mt-2 text-gray-600 dark:text-gray-400">
            Fetching session data for {{ sessionId }}...
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

    <template v-if="!loading && !showServerError">
      <!-- Session Content -->
      <ScriptPage :sessionData="sessionData" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ServerErrorPage from './ServerErrorPage.vue';
import ScriptPage from './ScriptPage.vue';

interface Session {
  id: string;
  name: string;
  startTime: string;
  lastUpdated: string;
  type: string;
  state: Record<string, unknown>;
}

interface Props {
  sessionId: string;
}

const props = defineProps<Props>();

// Reactive state
const loading = ref(true);
const loadingMessage = ref('Initializing...');
const showServerError = ref(false);
const serverError = ref('');
const sessionData = ref<Session | null>(null);

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

// Fetch specific session
const fetchSession = async (): Promise<Session | null> => {
  try {
    loadingMessage.value = `Loading session ${props.sessionId}...`;
    const apiBaseUrl = getApiBaseUrl();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const sessionResponse = await fetch(
      `${apiBaseUrl}/sessions/${props.sessionId}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (sessionResponse.ok) {
      const result = await sessionResponse.json();
      const session = result.data || result;
      loadingMessage.value = `Loaded session: ${session.name || props.sessionId}`;
      return session;
    } else if (sessionResponse.status === 404) {
      serverError.value = `Session ${props.sessionId} not found`;
      return null;
    } else {
      serverError.value = `Failed to load session: ${sessionResponse.status} ${sessionResponse.statusText}`;
      return null;
    }
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        serverError.value = 'Session loading timed out (10 seconds)';
      } else {
        serverError.value = `Failed to load session: ${err.message}`;
      }
    } else {
      serverError.value = 'Unknown error while loading session';
    }
    return null;
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

    // Step 2: Fetch the specific session
    const session = await fetchSession();

    if (!session && serverError.value) {
      showServerError.value = true;
      return;
    }

    sessionData.value = session;

    // Small delay to show the final message
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (err) {
    showServerError.value = true;
    serverError.value =
      err instanceof Error
        ? err.message
        : 'Unexpected error during session loading';
  } finally {
    loading.value = false;
  }
};

// Initialize on component mount
onMounted(() => {
  initialize();
});
</script>
