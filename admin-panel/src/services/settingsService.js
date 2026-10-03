import { api } from "../api/client";

export const settingsService = {
  get: (token) => api.settings.get(token),
  update: (token, data) => api.settings.update(token, data),
};

export default settingsService;
