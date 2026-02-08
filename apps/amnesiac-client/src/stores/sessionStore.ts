import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { sessionApi } from '../utils/api';

interface Session {
  id: string;
  name: string;
  startTime: string;
  lastUpdated: string;
  type: string;
  state: Record<string, unknown>;
}

export const useSessionStore = defineStore('sessions', () => {
  // State
  const sessions = ref<Session[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const sessionCount = computed(() => sessions.value.length);
  const sessionsByType = computed(() => {
    const grouped: Record<string, Session[]> = {};
    sessions.value.forEach((session) => {
      if (!grouped[session.type]) {
        grouped[session.type] = [];
      }
      grouped[session.type].push(session);
    });
    return grouped;
  });

  // Actions
  const fetchSessions = async () => {
    loading.value = true;
    error.value = null;

    try {
      console.log('Fetching sessions from API...');
      const response = await sessionApi.getAllSessions();
      console.log('API response:', response);

      // Handle the API response format: {success: true, data: Session[]}
      if (response && typeof response === 'object' && 'data' in response) {
        sessions.value = (response as { data: Session[] }).data;
      } else {
        // Fallback for direct array response
        sessions.value = response as Session[];
      }

      console.log('Sessions set to:', sessions.value);
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error fetching sessions:', err);
    } finally {
      loading.value = false;
    }
  };
  const createSession = async (sessionData: {
    name: string;
    type: string;
    state?: Record<string, unknown>;
  }) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await sessionApi.createSession(sessionData);

      // Handle the API response format: {success: true, data: Session}
      let newSession: Session;
      if (response && typeof response === 'object' && 'data' in response) {
        newSession = (response as { data: Session }).data;
      } else {
        newSession = response as Session;
      }

      sessions.value.push(newSession);
      return newSession;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error creating session:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const deleteSession = async (sessionId: string) => {
    loading.value = true;
    error.value = null;

    try {
      await sessionApi.deleteSession(sessionId);
      sessions.value = sessions.value.filter(
        (session) => session.id !== sessionId
      );
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error deleting session:', err);
      return false;
    } finally {
      loading.value = false;
    }
  };

  const updateSession = async (
    sessionId: string,
    sessionData: Partial<Session>
  ) => {
    loading.value = true;
    error.value = null;

    try {
      const response = await sessionApi.updateSession(sessionId, sessionData);

      // Handle the API response format: {success: true, data: Session}
      let updatedSession: Session;
      if (response && typeof response === 'object' && 'data' in response) {
        updatedSession = (response as { data: Session }).data;
      } else {
        updatedSession = response as Session;
      }

      const index = sessions.value.findIndex(
        (session) => session.id === sessionId
      );
      if (index !== -1) {
        sessions.value[index] = updatedSession;
      }
      return updatedSession;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Error updating session:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    // State
    sessions,
    loading,
    error,

    // Getters
    sessionCount,
    sessionsByType,

    // Actions
    fetchSessions,
    createSession,
    deleteSession,
    updateSession,
    clearError,
  };
});
