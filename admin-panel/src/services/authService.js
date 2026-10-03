import { api } from "../api/client";

export const authService = {
  signup: (data) => api.auth.signup(data),
  login: (data) => api.auth.login(data),
  googleLogin: (credential) => api.auth.googleLogin(credential),
  me: (token) => api.auth.me(token),
  updateProfile: (token, data) => api.auth.updateProfile(token, data),
  updateProfilePhoto: (token, file) => api.auth.updateProfilePhoto(token, file),
  deleteProfilePhoto: (token) => api.auth.deleteProfilePhoto(token),
  changePassword: (token, newPassword) => api.auth.changePassword(token, newPassword),
};

export default authService;
