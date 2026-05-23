const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/logs';

// Helper to get request headers, including optional custom AI API key
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const apiKey = localStorage.getItem('copilot_api_key');
  if (apiKey) {
    headers['X-Copilot-API-Key'] = apiKey;
  }
  return headers;
};

export const api = {
  // Fetch logs with optional filtering
  async getLogs(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const url = `${BASE_URL}?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.statusText}`);
    }
    return response.json();
  },

  // Fetch a single log detail
  async getLog(id) {
    const response = await fetch(`${BASE_URL}/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch log details: ${response.statusText}`);
    }
    return response.json();
  },

  // Log a new work entry
  async createLog(logData) {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(logData),
    });
    if (!response.ok) {
      throw new Error(`Failed to create log: ${response.statusText}`);
    }
    return response.json();
  },

  // Edit a work entry
  async updateLog(id, logData) {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(logData),
    });
    if (!response.ok) {
      throw new Error(`Failed to update log: ${response.statusText}`);
    }
    return response.json();
  },

  // Delete a work entry
  async deleteLog(id) {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`Failed to delete log: ${response.statusText}`);
    }
    return true;
  },

  // Fetch summary of logged entries
  async getSummary(filters = {}, useLlm = false) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    params.append('useLlm', useLlm.toString());

    const url = `${BASE_URL}/summary?${params.toString()}`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to generate summary: ${response.statusText}`);
    }
    return response.json();
  },
};
