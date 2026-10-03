import { api } from "../api/client";

export const employeeService = {
  getAll: (token, queryParams) => api.employees.getAll(token, queryParams),
  getById: (token, id) => api.employees.getById(token, id),
  create: (token, data) => api.employees.create(token, data),
  onboard: (token, data) => api.employees.onboard(token, data),
  uploadPhoto: (token, id, file) => api.employees.uploadPhoto(token, id, file),
  deletePhoto: (token, id) => api.employees.deletePhoto(token, id),
  updateFull: (token, id, data) => api.employees.updateFull(token, id, data),
  update: (token, id, data) => api.employees.update(token, id, data),
  remove: (token, id) => api.employees.remove(token, id),
  updateRole: (token, id, role) => api.employees.updateRole(token, id, role),
};

export default employeeService;
