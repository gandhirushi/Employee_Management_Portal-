import { api } from "../api/client";

export const dashboardService = {
  getStats: (token) => api.dashboard.getStats(token),
};

export default dashboardService;
