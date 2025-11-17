## FarmConnect Mobile (Expo)

This folder contains a React Native / Expo version of your FarmConnect app, designed to be run with **Expo Go** on your phone.  
The mobile app uses **the same backend APIs** as the React + Vite web app (e.g. `https://agrofarm-vd8i.onrender.com/api/...`).

### 1. Install dependencies

From the project root:

```bash
cd mobile
npm install
```

Make sure you have the Expo CLI:

```bash
npx expo start
```

### 2. Run on your phone (Expo Go)

1. Install the **Expo Go** app from the Play Store / App Store.
2. In this folder, run:

```bash
npm start
```

3. Scan the QR code with Expo Go to open the app.

### 3. Main structure

- `App.js`: Sets up React Navigation and all main screens.
- `src/context/AuthContext.js`: Simple auth context for role + user info on mobile.
- `src/api/client.js`: Axios client reusing the same API base URL as the web app.
- `src/screens/*`: Mobile equivalents of:
  - Landing / Get Started (`LandingScreen`)
  - Auth modal (`AuthScreen`) – uses the same farmer/buyer/supplier endpoints
  - Farmer / Buyer / Supplier dashboards (`FarmerDashboardScreen`, `BuyerDashboardScreen`, `SupplierDashboardScreen`)
  - Chatbot widget (`ChatBotScreen`) – uses the same chatbot endpoint.

### 4. Important note about authentication

The **web app** uses HTTP‑only cookies with `withCredentials: true` for authentication.  
On **mobile / Expo**, browser cookies are **not** managed the same way, so:

- All endpoints and URLs are the same as the web app.
- Some authenticated endpoints may require backend adjustments (e.g. issuing a token and accepting it via `Authorization` header) to work fully from the mobile app.

If you add token support to the backend, you can update `src/api/client.js` and `src/context/AuthContext.js` to store and send the token with each request.


