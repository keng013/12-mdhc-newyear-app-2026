import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
});
// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Participant
export const registerParticipant = (data) =>
  api.post("/participants/register", data);

export const checkInParticipant = (employeeId) =>
  api.post("/participants/checkin", { employeeId });

export const getParticipants = () => api.get("/participants");

export const checkRegistered = (employeeId) =>
  api.get(`/participants/check/${employeeId}`);

export const bulkImportParticipants = (participants) =>
  api.post("/participants/bulk-import", { participants });

export const bulkCheckInAll = () => api.post("/participants/checkin-all");

export const updateParticipant = (id, data) =>
  api.put(`/participants/${id}`, data);

export const deleteParticipant = (id) => api.delete(`/participants/${id}`);

// Prize
export const getPrizes = () => api.get("/admin/prizes");

export const createPrize = (data) => api.post("/admin/prizes", data);

export const updatePrize = (id, data) => api.put(`/admin/prizes/${id}`, data);

export const deletePrize = (id) => api.delete(`/admin/prizes/${id}`);

export const resetPrizes = () => api.post("/admin/prizes/reset");

export const deleteAllPrizes = () => api.post("/admin/prizes/delete-all");

// Lucky Draw
export const startLuckyDraw = async (payload) => {
  try {
    const res = await api.post("/admin/lucky-draw/start", payload);
    return res.data; // ✔ ใช้ res
  } catch (err) {
    console.error("API startLuckyDraw error:", err);
    throw err; // ✔ สำคัญมาก
  }
};

export const redrawLuckyDraw = (resultId) =>
  api.post("/admin/lucky-draw/redraw", { resultId });

export const getLuckyDrawResults = () => api.get("/admin/lucky-draw/results");

// Auth
export const login = (data) => api.post("/auth/login", data);

export const getDashboardStats = () => api.get("/dashboard/stats");

export const getRecentActivities = () => api.get("/dashboard/activities");

export default api;
