<template>
  <div class="error-page">
    <div class="error-container">
      <!-- Error Icon -->
      <div class="error-icon">
        <svg
          class="h-16 w-16 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      </div>

      <!-- Error Content -->
      <div class="error-content">
        <h1 class="error-title">Server Connection Failed</h1>

        <p class="error-message">
          We're unable to connect to the Amnesiac server. This could be due to:
        </p>

        <ul class="error-reasons">
          <li>Server maintenance or temporary downtime</li>
          <li>Network connectivity issues</li>
          <li>Server configuration problems</li>
        </ul>

        <p class="refresh-hint">Please refresh the page to try again.</p>

        <div class="help-section">
          <p class="help-text">If this problem persists, please let us know:</p>

          <div class="help-links">
            <a
              href="https://github.com/AbstractDevs/amnesiac/issues/new?template=bug_report.md&title=Server%20Connection%20Failed"
              target="_blank"
              rel="noopener noreferrer"
              class="help-link primary"
            >
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                />
              </svg>
              Report on GitHub
            </a>
          </div>
        </div>

        <!-- Technical Details (collapsible) -->
        <details class="technical-details">
          <summary class="technical-summary">Technical Details</summary>
          <div class="technical-content">
            <p><strong>API URL:</strong> {{ apiUrl }}</p>
            <p><strong>Base URL:</strong> {{ baseUrl }}</p>
            <p>
              <strong>Error:</strong>
              {{ errorMessage || 'Connection timeout or server unreachable' }}
            </p>
            <p><strong>Time:</strong> {{ new Date().toLocaleString() }}</p>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  errorMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  errorMessage: '',
});

// Get environment variables for display
const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';
const baseUrl =
  import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.error-container {
  background: white;
  border-radius: 1rem;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 28rem;
  width: 100%;
  padding: 2rem;
  text-align: center;
}

.error-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.error-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
}

.error-message {
  color: #6b7280;
  margin-bottom: 1rem;
}

.error-reasons {
  text-align: left;
  color: #6b7280;
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.error-reasons li {
  margin: 0.5rem 0;
}

.refresh-hint {
  color: #6b7280;
  font-style: italic;
  margin: 1.5rem 0;
}

.help-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.help-text {
  color: #6b7280;
  margin-bottom: 1rem;
}

.help-links {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.help-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.help-link.primary {
  background: #1f2937;
  color: white;
}

.help-link.primary:hover {
  background: #111827;
}

.technical-details {
  margin-top: 1.5rem;
  text-align: left;
}

.technical-summary {
  cursor: pointer;
  color: #6b7280;
  font-weight: 500;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.technical-content {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-top: 0.5rem;
  font-family: monospace;
  font-size: 0.875rem;
  color: #374151;
}

.technical-content p {
  margin: 0.25rem 0;
  word-break: break-all;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .error-container {
    background: #1f2937;
    color: #f9fafb;
  }

  .error-title {
    color: #f9fafb;
  }

  .technical-content {
    background: #374151;
    color: #d1d5db;
  }

  .technical-summary {
    color: #d1d5db;
    border-color: #4b5563;
  }
}
</style>
