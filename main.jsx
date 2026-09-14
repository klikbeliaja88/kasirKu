// Uses Supabase if VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set in
// your .env file, otherwise falls back to the browser's localStorage.
// Either way this must finish running BEFORE App mounts, since App calls
// window.storage as soon as it renders.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

async function boot() {
  if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
    await import("./storageSupabase.js");
  } else {
    await import("./storagePolyfill.js");
  }

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

boot();
