/**
 * Normalize API base URL to always include the /api prefix
 */
const DEFAULT_API_HOST = 'http://localhost:8000';

const normalizeBaseUrl = (providedUrl) => {
  const raw = (providedUrl || DEFAULT_API_HOST).trim();
  const withoutTrailingSlash = raw.replace(/\/+$/, '');
  return withoutTrailingSlash.endsWith('/api')
    ? withoutTrailingSlash
    : `${withoutTrailingSlash}/api`;
};

export const API_BASE_URL = normalizeBaseUrl(process.env.REACT_APP_API_URL);
