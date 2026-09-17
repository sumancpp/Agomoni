/**
 * Central API utility for Agomoni.
 *
 * Resolves the backend host:
 * 1. Explicit import.meta.env.VITE_API_URL if configured
 * 2. In production / remote deployments (e.g. Vercel): defaults to Render backend ('https://agomoni-4j0h.onrender.com')
 * 3. In local development: defaults to 'http://localhost:4000'
 */

const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/$/, '');
  }

  // If running in browser and not on localhost, use the production Render backend
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1' &&
    window.location.hostname !== ''
  ) {
    return 'https://agomoni-4j0h.onrender.com';
  }

  return 'http://localhost:4000';
};

const BASE_URL = getBaseUrl();

/**
 * Resolve an API path to a full URL.
 * @example apiUrl('/api/v1/music/playlists') → 'https://agomoni-4j0h.onrender.com/api/v1/music/playlists'
 */
export function apiUrl(path: string): string {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  return `${BASE_URL}${path}`;
}

/**
 * Convenience wrapper around fetch that automatically prepends the API base URL.
 */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  return fetch(apiUrl(path), init);
}
