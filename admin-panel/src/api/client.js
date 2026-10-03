import { API_BASE_URL } from "../config/env";
import { toFormData } from "../utils/formData";

const TOKEN_KEY = "YORK_auth_token";

/**
 * Retrieves the stored auth token from localStorage or sessionStorage
 */
export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

// In-flight promise map to deduplicate simultaneous identical GET requests
const inFlightRequests = new Map();
// Short-term client-side response cache (15 seconds TTL)
const clientCache = new Map();
const CLIENT_CACHE_TTL_MS = 15000;

/**
 * Clears the client-side API memory cache.
 */
export function clearClientCache() {
  clientCache.clear();
}

/**
 * Standardized HTTP request handler with automatic token injection,
 * in-flight request deduplication, and short-term caching.
 */
async function request(endpoint, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const url = `${API_BASE_URL}${endpoint}`;
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  // On any mutating operation, purge client-side cache immediately
  if (method !== "GET") {
    clearClientCache();
  }

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  // Auto-inject Authorization header if not already explicitly provided
  if (!headers.Authorization && !headers.authorization) {
    const token = getStoredToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  // Check client-side cache for GET requests
  const cacheKey = `${url}:${headers.Authorization || "anon"}`;
  if (method === "GET") {
    const cached = clientCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CLIENT_CACHE_TTL_MS) {
      return JSON.parse(JSON.stringify(cached.data));
    }

    // Deduplicate identical in-flight GET requests
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey);
    }
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const text = await response.text();
      let data = null;

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }

      if (!response.ok) {
        const message =
          data?.error ||
          (typeof data?.errors === 'string' ? data.errors : null) ||
          data?.message ||
          `Request failed with status ${response.status}`;
        const err = new Error(message);
        if (data?.errors && typeof data.errors === 'object') {
          err.errors = data.errors;
        }
        throw err;
      }

      // Populate client cache on successful GET
      if (method === "GET" && data) {
        clientCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
      }

      return data;
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    } finally {
      if (method === "GET") {
        inFlightRequests.delete(cacheKey);
      }
    }
  })();

  if (method === "GET") {
    inFlightRequests.set(cacheKey, fetchPromise);
  }

  return fetchPromise;
}


function resolveTokenAndData(first, second) {
  if (typeof first === 'string' && second !== undefined) {
    return { token: first, data: second };
  }
  return { token: null, data: first };
}

function resolveTokenIdAndData(first, second, third) {
  if (typeof first === 'string' && (typeof second === 'string' || typeof second === 'number')) {
    return { token: first, id: second, data: third };
  }
  return { token: null, id: first, data: second };
}

function authHeader(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ============================================================
// AUTHENTICATION
// ============================================================

const auth = {
  // POST /api/auth/signup
  signup(data) {
    return request("/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      }),
    });
  },

  // POST /api/auth/login
  login(data) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });
  },

  // POST /api/auth/google
  googleLogin(credential) {
    return request("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    });
  },

  // GET /api/auth/me
  me(token) {
    return request("/auth/me", {
      method: "GET",
      headers: authHeader(token),
    });
  },

  // PATCH /api/auth/profile
  updateProfile(tokenOrData, maybeData) {
    const { token, data } = resolveTokenAndData(tokenOrData, maybeData);
    return request("/auth/profile", {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },

  // POST /api/auth/profile/photo
  updateProfilePhoto(tokenOrFile, maybeFile) {
    const token = typeof tokenOrFile === 'string' ? tokenOrFile : null;
    const file = maybeFile || tokenOrFile;
    const formData = new FormData();
    formData.append("photo", file);

    return request("/auth/profile/photo", {
      method: "POST",
      headers: authHeader(token),
      body: formData,
    });
  },

  // DELETE /api/auth/profile/photo
  deleteProfilePhoto(token) {
    return request("/auth/profile/photo", {
      method: "DELETE",
      headers: authHeader(token),
    });
  },

  // PATCH /api/auth/password
  changePassword(tokenOrPassword, maybePassword) {
    const token = typeof tokenOrPassword === 'string' && maybePassword !== undefined ? tokenOrPassword : null;
    const newPassword = maybePassword || tokenOrPassword;

    return request("/auth/password", {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify({ newPassword }),
    });
  },
};

// ============================================================
// EMPLOYEES
// ============================================================

const employees = {
  // GET /api/employees
  getAll(tokenOrParams = {}, maybeParams = {}) {
    const token = typeof tokenOrParams === 'string' ? tokenOrParams : null;
    const queryParams = (token ? maybeParams : tokenOrParams) || {};

    let url = "/employees";
    const params = new URLSearchParams();

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return request(url, {
      method: "GET",
      headers: authHeader(token),
    });
  },

  // GET /api/employees/:id
  getById(tokenOrId, maybeId) {
    const token = typeof tokenOrId === 'string' && maybeId ? tokenOrId : null;
    const id = maybeId || tokenOrId;

    return request(`/employees/${id}`, {
      method: "GET",
      headers: authHeader(token),
    });
  },

  // POST /api/employees (supports optional photo via FormData)
  create(tokenOrData, maybeData) {
    const { token, data } = resolveTokenAndData(tokenOrData, maybeData);

    if (data?.photoFile) {
      return request("/employees", {
        method: "POST",
        headers: authHeader(token),
        body: toFormData(data),
      });
    }

    return request("/employees", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },

  // POST /api/employees/onboarding
  onboard(tokenOrData, maybeData) {
    const { token, data } = resolveTokenAndData(tokenOrData, maybeData);

    if (data?.photoFile) {
      return request("/employees/onboarding", {
        method: "POST",
        headers: authHeader(token),
        body: toFormData(data),
      });
    }

    return request("/employees/onboarding", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },

  // PATCH /api/employees/:id/photo
  uploadPhoto(tokenOrId, idOrFile, maybeFile) {
    let token = null;
    let id = tokenOrId;
    let file = idOrFile;

    if (maybeFile) {
      token = tokenOrId;
      id = idOrFile;
      file = maybeFile;
    }

    const formData = new FormData();
    formData.append("photo", file);

    return request(`/employees/${id}/photo`, {
      method: "PATCH",
      headers: authHeader(token),
      body: formData,
    });
  },

  // DELETE /api/employees/:id/photo
  deletePhoto(tokenOrId, maybeId) {
    const token = typeof tokenOrId === 'string' && maybeId ? tokenOrId : null;
    const id = maybeId || tokenOrId;

    return request(`/employees/${id}/photo`, {
      method: "DELETE",
      headers: authHeader(token),
    });
  },

  // PUT /api/employees/:id (supports optional photo via FormData)
  updateFull(tokenOrId, idOrData, maybeData) {
    const { token, id, data } = resolveTokenIdAndData(tokenOrId, idOrData, maybeData);

    if (data?.photoFile) {
      return request(`/employees/${id}`, {
        method: "PUT",
        headers: authHeader(token),
        body: toFormData(data),
      });
    }

    return request(`/employees/${id}`, {
      method: "PUT",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },

  // PATCH /api/employees/:id (supports optional photo via FormData)
  update(tokenOrId, idOrData, maybeData) {
    const { token, id, data } = resolveTokenIdAndData(tokenOrId, idOrData, maybeData);

    if (data?.photoFile) {
      return request(`/employees/${id}`, {
        method: "PATCH",
        headers: authHeader(token),
        body: toFormData(data),
      });
    }

    return request(`/employees/${id}`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },

  // DELETE /api/employees/:id
  remove(tokenOrId, maybeId) {
    const token = typeof tokenOrId === 'string' && maybeId ? tokenOrId : null;
    const id = maybeId || tokenOrId;

    return request(`/employees/${id}`, {
      method: "DELETE",
      headers: authHeader(token),
    });
  },

  // PATCH /api/employees/:id/role
  updateRole(tokenOrId, idOrRole, maybeRole) {
    let token = null;
    let id = tokenOrId;
    let role = idOrRole;

    if (maybeRole !== undefined) {
      token = tokenOrId;
      id = idOrRole;
      role = maybeRole;
    }

    return request(`/employees/${id}/role`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify({ role }),
    });
  },
};

// ============================================================
// NOTIFICATIONS
// ============================================================

const notifications = {
  // GET /api/notifications
  getAll(token) {
    return request("/notifications", {
      method: "GET",
      headers: authHeader(token),
    });
  },

  // POST /api/notifications
  create(tokenOrData, maybeData) {
    const { token, data } = resolveTokenAndData(tokenOrData, maybeData);
    return request("/notifications", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },

  // PATCH /api/notifications/:id/read
  markRead(tokenOrId, maybeId) {
    const token = typeof tokenOrId === 'string' && maybeId ? tokenOrId : null;
    const id = maybeId || tokenOrId;
    return request(`/notifications/${id}/read`, {
      method: "PATCH",
      headers: authHeader(token),
    });
  },

  // PATCH /api/notifications/read-all
  markAllRead(token) {
    return request("/notifications/read-all", {
      method: "PATCH",
      headers: authHeader(token),
    });
  },

  // DELETE /api/notifications/:id
  delete(tokenOrId, maybeId) {
    const token = typeof tokenOrId === 'string' && maybeId ? tokenOrId : null;
    const id = maybeId || tokenOrId;
    return request(`/notifications/${id}`, {
      method: "DELETE",
      headers: authHeader(token),
    });
  },

  // DELETE /api/notifications
  clearAll(token) {
    return request("/notifications", {
      method: "DELETE",
      headers: authHeader(token),
    });
  },
};

// ============================================================
// SETTINGS
// ============================================================

const settings = {
  // GET /api/settings
  get(token) {
    return request("/settings", {
      method: "GET",
      headers: authHeader(token),
    });
  },

  // PATCH /api/settings
  update(tokenOrData, maybeData) {
    const { token, data } = resolveTokenAndData(tokenOrData, maybeData);
    return request("/settings", {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },
};

// ============================================================
// DASHBOARD
// ============================================================

const dashboard = {
  getStats(token) {
    return request("/employees/dashboard/stats", {
      method: "GET",
      headers: authHeader(token),
    });
  },
};

// ============================================================
// LEAVES
// ============================================================

const leaves = {
  // POST /api/leaves
  apply(tokenOrData, maybeData) {
    const { token, data } = resolveTokenAndData(tokenOrData, maybeData);
    return request("/leaves", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },

  // GET /api/leaves/my
  getMyLeaves(token) {
    return request("/leaves/my", {
      method: "GET",
      headers: authHeader(token),
    });
  },

  // GET /api/leaves
  getAll(tokenOrParams = {}, maybeParams = {}) {
    const token = typeof tokenOrParams === 'string' ? tokenOrParams : null;
    const queryParams = (token ? maybeParams : tokenOrParams) || {};

    let url = "/leaves";
    const params = new URLSearchParams();

    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return request(url, {
      method: "GET",
      headers: authHeader(token),
    });
  },

  // PATCH /api/leaves/:id/status
  updateStatus(tokenOrId, idOrData, maybeData) {
    const { token, id, data } = resolveTokenIdAndData(tokenOrId, idOrData, maybeData);
    return request(`/leaves/${id}/status`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify(data),
    });
  },
};

// ============================================================
// CHAT
// ============================================================

const chat = {
  // GET /api/chat/conversations
  getConversations(token) {
    return request("/chat/conversations", {
      method: "GET",
      headers: authHeader(token),
    });
  },

  // POST /api/chat/conversations
  startConversation(tokenOrPayload, maybePayload) {
    const { token, data: payload } = resolveTokenAndData(tokenOrPayload, maybePayload);
    return request("/chat/conversations", {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(payload),
    });
  },

  // GET /api/chat/conversations/:id/messages
  getMessages(tokenOrId, idOrOptions = {}, maybeOptions = {}) {
    let token = null;
    let conversationId = tokenOrId;
    let options = idOrOptions;

    if (typeof tokenOrId === 'string' && (typeof idOrOptions === 'string' || typeof idOrOptions === 'number')) {
      token = tokenOrId;
      conversationId = idOrOptions;
      options = maybeOptions;
    }

    const { page = 1, limit = 50 } = options || {};
    return request(`/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`, {
      method: "GET",
      headers: authHeader(token),
    });
  },

  // POST /api/chat/conversations/:id/messages
  sendMessage(tokenOrId, idOrContent, maybeContent) {
    let token = null;
    let conversationId = tokenOrId;
    let content = idOrContent;

    if (maybeContent !== undefined) {
      token = tokenOrId;
      conversationId = idOrContent;
      content = maybeContent;
    }

    return request(`/chat/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ content }),
    });
  },

  // PATCH /api/chat/messages/:id
  editMessage(tokenOrId, idOrContent, maybeContent) {
    let token = null;
    let messageId = tokenOrId;
    let content = idOrContent;

    if (maybeContent !== undefined) {
      token = tokenOrId;
      messageId = idOrContent;
      content = maybeContent;
    }

    return request(`/chat/messages/${messageId}`, {
      method: "PATCH",
      headers: authHeader(token),
      body: JSON.stringify({ content }),
    });
  },

  // PATCH /api/chat/conversations/:id/read
  markRead(tokenOrId, maybeId) {
    const token = typeof tokenOrId === 'string' && maybeId ? tokenOrId : null;
    const conversationId = maybeId || tokenOrId;

    return request(`/chat/conversations/${conversationId}/read`, {
      method: "PATCH",
      headers: authHeader(token),
    });
  },

  // GET /api/chat/unread-count
  getUnreadCount(token) {
    return request("/chat/unread-count", {
      method: "GET",
      headers: authHeader(token),
    });
  },
};

// ============================================================
// MAIN API OBJECT
// ============================================================

export const api = {
  request,
  baseURL: API_BASE_URL,
  auth,
  employees,
  notifications,
  settings,
  dashboard,
  leaves,
  chat,

  // Direct method aliases for full backwards compatibility
  signup: auth.signup,
  login: auth.login,
  googleLogin: auth.googleLogin,
  me: auth.me,
  updateProfile: auth.updateProfile,
  changePassword: auth.changePassword,
  updateProfilePhoto: auth.updateProfilePhoto,
  deleteProfilePhoto: auth.deleteProfilePhoto,

  getEmployees: employees.getAll,
  getEmployee: employees.getById,
  createEmployee: employees.create,
  onboardEmployee: employees.onboard,
  updateEmployee: employees.update,
  updateEmployeeFull: employees.updateFull,
  updateEmployeeRole: employees.updateRole,
  deleteEmployee: employees.remove,

  applyLeave: leaves.apply,
  getMyLeaves: leaves.getMyLeaves,
  getAllLeaves: leaves.getAll,
  updateLeaveStatus: leaves.updateStatus,

  getConversations: chat.getConversations,
  startConversation: chat.startConversation,
  getMessages: chat.getMessages,
  sendMessage: chat.sendMessage,
  editMessage: chat.editMessage,
  markMessagesRead: chat.markRead,
  getChatUnreadCount: chat.getUnreadCount,
};

export default api;