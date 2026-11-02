import axios from "axios";
const url = import.meta.env.VITE_API_URL;

const API = axios.create({
  baseURL: `${url}/api`
})

//kirim token
API.interceptors.request.use(config => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

// handle token expired
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = ["/login", "/register", "/auth/google"].includes(error.config?.url);
    if (error.response && error.response.status === 401 && !isAuthRequest) {
      console.log("Token expired / unauthorized");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userInfo");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// base url file upload (foto kamar, ktp, bukti bayar, dll)
export const userImageStorage = `${url}/storage`;
export const imageStorage = (path) => (path ? `${url}/storage/${path}` : null);

// helper: ubah object menjadi FormData (untuk upload file)
export const toFormData = (obj = {}) => {
  const fd = new FormData();
  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((v) => fd.append(`${key}[]`, v));
    } else {
      fd.append(key, value);
    }
  });
  return fd;
};

export default API;
