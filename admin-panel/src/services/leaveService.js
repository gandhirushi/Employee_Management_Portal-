import { api } from "../api/client";

export const leaveService = {
  apply: (token, data) => api.leaves.apply(token, data),
  getMyLeaves: (token) => api.leaves.getMyLeaves(token),
  getAll: (token, queryParams) => api.leaves.getAll(token, queryParams),
  updateStatus: (token, id, data) => api.leaves.updateStatus(token, id, data),
};

export default leaveService;
