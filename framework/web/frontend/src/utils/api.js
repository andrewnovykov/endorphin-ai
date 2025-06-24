const API_BASE_URL = '/api';

class APIError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.response = response;
  }
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(`Network error: ${error.message}`, 0, null);
  }
}

// Tests API
export async function fetchTests() {
  return apiRequest('/tests');
}

export async function fetchTestById(testId) {
  return apiRequest(`/tests/${testId}`);
}

export async function runTest(testId) {
  return apiRequest(`/tests/${testId}/run`, {
    method: 'POST',
  });
}

// Results API
export async function fetchResults() {
  return apiRequest('/results');
}

export async function getJobResult(jobId) {
  return apiRequest(`/results/${jobId}`);
}

// Convenience object export for easier imports
export const api = {
  fetchTests,
  fetchTestById,
  runTest,
  fetchResults,
  getJobResult,
  // Utility function to get screenshot URL
  getScreenshotUrl: (filename) => `${API_BASE_URL}/screenshots/${filename}`,
};
