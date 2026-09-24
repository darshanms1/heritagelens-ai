import { API_URL } from '../utils/constants';

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Network response was not ok';
    try {
      const errObj = JSON.parse(errorText);
      errorMessage = errObj.message || errorMessage;
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    return { error: true, message: errorMessage };
  }
  return response.json();
};

export const analyzeImage = async (file, language, level) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('language', language);
    formData.append('level', level);

    const res = await fetch(`${API_URL}/heritage/analyze`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return handleResponse(res);
  } catch (error) {
    clearTimeout(timeoutId);
    return { 
      error: true, 
      message: error.name === 'AbortError'
        ? "Visual analysis request timed out. Please try uploading again or select from the monument directory below."
        : error.message 
    };
  }
};

export const getExplanation = async (siteId, monumentId, language, level) => {
  try {
    const res = await fetch(`${API_URL}/heritage/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site_id: siteId, monument_id: monumentId, language, level }),
    });
    return handleResponse(res);
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const askFollowUp = async (question, monumentId, previousContext, language) => {
  try {
    const res = await fetch(`${API_URL}/heritage/followup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, monument_id: monumentId, previous_context: previousContext, language }),
    });
    return handleResponse(res);
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const getSites = async () => {
  try {
    const res = await fetch(`${API_URL}/heritage/sites`);
    return handleResponse(res);
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const getMonuments = async (siteId) => {
  try {
    const res = await fetch(`${API_URL}/heritage/sites/${siteId}/monuments`);
    return handleResponse(res);
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const getAllMonuments = async () => {
  try {
    const res = await fetch(`${API_URL}/heritage/monuments`);
    return handleResponse(res);
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const getDemoExamples = async () => {
  try {
    const res = await fetch(`${API_URL}/demo/examples`);
    return handleResponse(res);
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const getDemoResult = async (demoId, language, level) => {
  try {
    const res = await fetch(`${API_URL}/demo/examples/${demoId}?language=${language}&level=${level}`);
    return handleResponse(res);
  } catch (error) {
    return { error: true, message: error.message };
  }
};

export const healthCheck = async () => {
  try {
    const res = await fetch(`${API_URL}/health`);
    return handleResponse(res);
  } catch (error) {
    return { error: true, message: error.message };
  }
};
