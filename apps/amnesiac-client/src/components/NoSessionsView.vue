<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950"
  >
    <main class="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="py-16 text-center">
        <!-- Amnesiac Icon -->
        <div class="mb-4">
          <img
            src="https://wiki.bloodontheclocktower.com/images/2/26/Icon_amnesiac.png"
            alt="Amnesiac Icon"
            class="mx-auto h-80 w-80 opacity-70 dark:opacity-50"
            style="
              object-fit: cover;
              object-position: center;
              clip-path: inset(15% 15% 15% 15%);
            "
          />
        </div>

        <!-- Main Message -->
        <h1
          class="mb-4 text-4xl font-bold text-gray-900 dark:text-gray-100 md:text-5xl"
        >
          No Sessions Available
        </h1>
        <p class="mb-8 text-xl text-gray-600 dark:text-gray-400">
          Please wait for an admin to create a Blood on the Clocktower session.
        </p>

        <!-- Countdown Message -->
        <p class="text-sm italic text-gray-500 dark:text-gray-400">
          Refreshing page in {{ countdown }} seconds to check for new
          sessions...
        </p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

// Countdown and polling state
const countdown = ref(30);
let countdownInterval: number | undefined;

// Get current polling delay based on attempt count
const getCurrentDelay = (): number => {
  return 30; // Simple 30 second delay
};

// Start countdown and auto-recheck
const startPolling = () => {
  // Clear any existing interval first
  cleanup();

  const delay = getCurrentDelay();
  countdown.value = delay;

  // Start countdown
  countdownInterval = window.setInterval(() => {
    countdown.value--;

    if (countdown.value <= 0) {
      // Clear the interval immediately to prevent multiple triggers
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = undefined;
      }

      // Refresh the page to check for new sessions
      window.location.reload();
    }
  }, 1000);
};

// Cleanup intervals
const cleanup = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = undefined;
  }
};

// Lifecycle hooks
onMounted(() => {
  startPolling();
});

onUnmounted(() => {
  cleanup();
});
</script>
