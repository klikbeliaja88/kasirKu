// Replaces the localStorage-backed polyfill with real cloud storage on
// Supabase. Implements the exact same window.storage contract
// (get/set/delete/list) that App.jsx already calls — App.jsx itself needs
// zero changes.
//
// Requires two environment variables (see .env.example):
//   VITE_SUPABASE_URL
//   VITE_SUPABASE_ANON_KEY
//
// Data is stored in a single table `kasirku_storage` (key/value + timestamp).
// Run supabase-schema.sql in your Supabase project's SQL Editor once before
// using this.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diisi. Salin .env.example jadi .env dan isi kredensial Supabase kamu, lalu restart dev server."
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const TABLE = "kasirku_storage";

window.storage = {
  async get(key) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("key, value")
      .eq("key", key)
      .maybeSingle();

    if (error) throw new Error(`Supabase get() gagal: ${error.message}`);
    if (!data) throw new Error(`Key not found: ${key}`);
    return { key: data.key, value: data.value, shared: false };
  },

  async set(key, value) {
    const { error } = await supabase
      .from(TABLE)
      .upsert({ key, value }, { onConflict: "key" });

    if (error) throw new Error(`Supabase set() gagal: ${error.message}`);
    return { key, value, shared: false };
  },

  async delete(key) {
    const { error } = await supabase.from(TABLE).delete().eq("key", key);
    if (error) throw new Error(`Supabase delete() gagal: ${error.message}`);
    return { key, deleted: true, shared: false };
  },

  async list(prefix) {
    let query = supabase.from(TABLE).select("key");
    if (prefix) query = query.like("key", `${prefix}%`);
    const { data, error } = await query;
    if (error) throw new Error(`Supabase list() gagal: ${error.message}`);
    return { keys: (data || []).map((row) => row.key) };
  },
};
