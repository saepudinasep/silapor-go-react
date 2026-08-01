// Store loading global yang sederhana (bukan React Context) supaya bisa
// diakses dari mana saja — termasuk dari axios interceptor di api/axios.js
// yang berjalan di luar tree React. Komponen React membaca store ini lewat
// hook `useSyncExternalStore` (lihat components/TopLoadingBar.jsx & LoadingOverlay.jsx).
//
// - `active`   → jumlah request yang sedang berjalan (GET, POST, dst, termasuk
//                perpindahan halaman). Dipakai untuk progress bar tipis di atas.
// - `mutating` → jumlah request insert/update/delete (POST/PUT/PATCH/DELETE)
//                yang sedang berjalan. Dipakai untuk overlay blocking di tengah
//                layar supaya user tidak bisa klik ganda saat submit.

const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

let activeRequests = 0;
let mutatingRequests = 0;
let snapshot = { active: 0, mutating: 0 };
const listeners = new Set();

function emitChange() {
  snapshot = { active: activeRequests, mutating: mutatingRequests };
  listeners.forEach((listener) => listener());
}

/** Dipanggil saat sebuah request/aksi mulai berjalan. */
export function beginRequest(method) {
  activeRequests += 1;
  if (MUTATING_METHODS.has((method || "").toLowerCase())) {
    mutatingRequests += 1;
  }
  emitChange();
}

/** Dipanggil saat request/aksi selesai (sukses maupun gagal). */
export function endRequest(method) {
  activeRequests = Math.max(0, activeRequests - 1);
  if (MUTATING_METHODS.has((method || "").toLowerCase())) {
    mutatingRequests = Math.max(0, mutatingRequests - 1);
  }
  emitChange();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return snapshot;
}
