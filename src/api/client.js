import axios from "axios";

// Reuse the same backend base URL and endpoints as the web app.
export const API_BASE_URL = "https://agrofarm-vd8i.onrender.com";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
});

// NOTE: On the web app, authentication relies heavily on HTTP-only cookies
// with `withCredentials: true`. In a mobile / Expo environment, those browser
// cookies are NOT automatically managed. This client keeps the same URLs,
// but you may need to adapt the backend to also support a token-based flow
// (e.g. Authorization header) for full parity with the web.


