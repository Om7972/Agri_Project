const getApiBaseUrl = (): string => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
  url = url.trim();
  // Ensure the URL ends with /api/v1
  if (!url.endsWith('/api/v1') && !url.endsWith('/api/v1/')) {
    if (url.endsWith('/')) {
      url = url + 'api/v1';
    } else {
      url = url + '/api/v1';
    }
  }
  return url;
};

export const API_BASE_URL = getApiBaseUrl();
