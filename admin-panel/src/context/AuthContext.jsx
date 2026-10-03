import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";

import { authService } from "../services/authService";

export const AuthContext = createContext(null);

const TOKEN_KEY = "YORK_auth_token";
const USER_KEY = "YORK_current_user";

function getStoredSession() {
  try {
    const token =
      localStorage.getItem(TOKEN_KEY) ||
      sessionStorage.getItem(TOKEN_KEY);

    const rawUser =
      localStorage.getItem(USER_KEY) ||
      sessionStorage.getItem(USER_KEY);

    if (!token || !rawUser) {
      return {
        token: null,
        user: null,
      };
    }

    return {
      token,
      user: JSON.parse(rawUser),
    };
  } catch {
    return {
      token: null,
      user: null,
    };
  }
}

function saveSession(token, user, rememberMe) {
  const storage = rememberMe ? localStorage : sessionStorage;

  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));

  const otherStorage = rememberMe
    ? sessionStorage
    : localStorage;

  otherStorage.removeItem(TOKEN_KEY);
  otherStorage.removeItem(USER_KEY);
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export function AuthProvider({ children }) {
  const initialSession = getStoredSession();

  const [user, setUser] = useState(initialSession.user);
  const [token, setToken] = useState(initialSession.token);
  const [loading, setLoading] = useState(!!initialSession.token);

  /*
   * When React starts, verify the stored JWT with the backend.
   */
  useEffect(() => {
    async function restoreSession() {
      if (!initialSession.token) {
        setLoading(false);
        return;
      }

      try {
        const result = await authService.me(initialSession.token);

        setUser(result.user);
        setToken(initialSession.token);

        const rememberMe = !!localStorage.getItem(TOKEN_KEY);

        saveSession(
          initialSession.token,
          result.user,
          rememberMe
        );
      } catch {
        clearSession();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  const updateUserSession = useCallback((updatedUser) => {
    setUser(updatedUser);
    const currentToken =
      localStorage.getItem(TOKEN_KEY) ||
      sessionStorage.getItem(TOKEN_KEY);
    const rememberMe = !!localStorage.getItem(TOKEN_KEY);
    if (currentToken && updatedUser) {
      saveSession(currentToken, updatedUser, rememberMe);
    }
  }, []);

  const login = useCallback(
    async (email, password, rememberMe) => {
      try {
        const result = await authService.login({
          email,
          password,
        });

        saveSession(
          result.token,
          result.user,
          !!rememberMe
        );

        setToken(result.token);
        setUser(result.user);

        return {
          ok: true,
          user: result.user,
        };
      } catch (error) {
        return {
          ok: false,
          error: error.message,
        };
      }
    },
    []
  );

  const signup = useCallback(
    async (fullName, email, password) => {
      try {
        const result = await authService.signup({
          fullName,
          email,
          password,
        });

        return {
          ok: true,
          user: result.user,
        };
      } catch (error) {
        return {
          ok: false,
          error: error.message,
          errors: error.errors || null,
        };
      }
    },
    []
  );

  const loginWithGoogle = useCallback(
    async (credential, rememberMe = false) => {
      try {
        const result = await authService.googleLogin(credential);

        saveSession(
          result.token,
          result.user,
          !!rememberMe
        );

        setToken(result.token);
        setUser(result.user);

        return {
          ok: true,
          user: result.user,
          isNewUser: result.isNewUser,
        };
      } catch (error) {
        return {
          ok: false,
          error: error.message,
        };
      }
    },
    []
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    setToken(null);
  }, []);

  const completeOnboarding = useCallback(() => {
    setUser((prev) => {
      const updated = { ...prev, isOnboarded: true };
      const rememberMe = !!localStorage.getItem(TOKEN_KEY);
      saveSession(token, updated, rememberMe);
      return updated;
    });
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      role: user?.role || null,
      login,
      signup,
      loginWithGoogle,
      logout,
      completeOnboarding,
      updateUserSession,
    }),
    [
      user,
      token,
      loading,
      login,
      signup,
      loginWithGoogle,
      logout,
      completeOnboarding,
      updateUserSession,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return ctx;
}

