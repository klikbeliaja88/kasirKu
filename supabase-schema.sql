-- KasirKU POS — Supabase schema
-- Jalankan seluruh file ini di Supabase Dashboard > SQL Editor > New query > Run.
--
-- Desain: aplikasi ini menyimpan SELURUH data toko (produk, transaksi, stok,
-- shift, dll) sebagai SATU blob JSON per key, persis seperti saat memakai
-- localStorage. Tabel ini hanya berperan sebagai "kotak penyimpanan" generik
-- (key -> value), BUKAN sebagai skema relasional per-entitas.
--
-- Konsekuensinya (baca README.md bagian "Batasan Supabase-sebagai-blob"):
-- - Data sekarang tersimpan di cloud, jadi bisa diakses dari banyak
--   perangkat/browser sekaligus (ini yang tidak bisa dilakukan localStorage).
-- - TAPI kalau dua kasir menyimpan pada detik yang sama, yang terakhir
--   menulis akan menimpa yang sebelumnya (last-write-wins), karena seluruh
--   data toko disimpan sebagai satu baris JSON, bukan per-transaksi.
--   Untuk toko dengan beberapa kasir aktif bersamaan di perangkat berbeda,
--   pertimbangkan migrasi ke skema relasional penuh (tabel terpisah per
--   entitas + Supabase Realtime) sebagai langkah lanjutan.

create table if not exists kasirku_storage (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz not null default now()
);

-- Aktifkan Row Level Security lalu buka akses baca/tulis untuk semua orang
-- yang memegang anon key (ini setara dengan level keamanan localStorage:
-- siapa pun yang bisa membuka aplikasinya juga bisa membaca/mengubah data).
-- Cocok untuk demo/UMKM skala kecil. Untuk keamanan lebih ketat, tambahkan
-- Supabase Auth dan ganti policy di bawah agar mensyaratkan user login.
alter table kasirku_storage enable row level security;

drop policy if exists "kasirku anon read" on kasirku_storage;
create policy "kasirku anon read"
  on kasirku_storage for select
  using (true);

drop policy if exists "kasirku anon write" on kasirku_storage;
create policy "kasirku anon write"
  on kasirku_storage for insert
  with check (true);

drop policy if exists "kasirku anon update" on kasirku_storage;
create policy "kasirku anon update"
  on kasirku_storage for update
  using (true)
  with check (true);

drop policy if exists "kasirku anon delete" on kasirku_storage;
create policy "kasirku anon delete"
  on kasirku_storage for delete
  using (true);

-- Auto-update kolom updated_at setiap kali baris diubah
create or replace function kasirku_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists kasirku_storage_updated_at on kasirku_storage;
create trigger kasirku_storage_updated_at
  before update on kasirku_storage
  for each row execute function kasirku_set_updated_at();
