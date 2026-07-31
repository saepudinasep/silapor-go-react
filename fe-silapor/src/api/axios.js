import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("silapor_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    const isAuthEndpoint = url.includes("/auth/");

    // Hanya paksa logout & redirect kalau 401 terjadi pada request yang
    // BUKAN percobaan login/registrasi — misalnya token kedaluwarsa saat
    // sedang memakai aplikasi. Kalau 401 berasal dari endpoint login itu
    // sendiri (username/password salah), biarkan komponen pemanggil yang
    // menampilkan pesan (SweetAlert2) tanpa dialihkan paksa ke halaman awal.
    if (err.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("silapor_token");
      localStorage.removeItem("silapor_user");
      localStorage.removeItem("silapor_role");
      window.location.href = "/";
    }
    return Promise.reject(err);
  },
);

export default api;
