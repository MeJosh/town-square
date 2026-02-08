// API utilities for connecting to the Amnesiac server
// Uses environment variables to determine the API endpoint

// Get API base URL from environment variables
const getApiBaseUrl = (): string => {
  // In development, use .env.local
  // In production, use environment variables set by GitHub Actions
  const apiUrl =
    import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:3000/api';
  return apiUrl;
};

// Get full API URL for health checks
const getApiUrl = (): string => {
  const apiUrl = import.meta.env.PUBLIC_API_URL || 'http://localhost:3000';
  return apiUrl;
};

// Generic API fetch wrapper
export const apiClient = {
  baseUrl: getApiBaseUrl(),

  async get<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('API GET request to:', url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    console.log('API GET response:', data);
    return data;
  },

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },
};

// Health check utility
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${getApiUrl()}/health`);
    return response.ok;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

// Session API methods
export const sessionApi = {
  async getAllSessions() {
    return apiClient.get('/sessions');
  },

  async getSession(id: string) {
    return apiClient.get(`/sessions/${id}`);
  },

  async createSession(sessionData: Record<string, unknown>) {
    return apiClient.post('/sessions', sessionData);
  },

  async updateSession(id: string, sessionData: Record<string, unknown>) {
    return apiClient.put(`/sessions/${id}`, sessionData);
  },

  async deleteSession(id: string) {
    return apiClient.delete(`/sessions/${id}`);
  },

  async updateSessionState(id: string, state: Record<string, unknown>) {
    return apiClient.put(`/sessions/${id}/state`, { state });
  },
};
