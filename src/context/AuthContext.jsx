import {
  createContext,
  useContext,
  useState,
} from "react";

import {
  login as loginRequest,
} from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem(
      "academic-global-token",
    );
  });

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem(
      "academic-global-user",
    );

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      return null;
    }
  });

  async function login(correo, password) {
    const data = await loginRequest(
      correo,
      password,
    );

    setToken(data.access_token);
    setUser(data.usuario);

    localStorage.setItem(
      "academic-global-token",
      data.access_token,
    );

    localStorage.setItem(
      "academic-global-user",
      JSON.stringify(data.usuario),
    );

    return data;
  }

  function logout() {
    setToken(null);
    setUser(null);

    localStorage.removeItem(
      "academic-global-token",
    );

    localStorage.removeItem(
      "academic-global-user",
    );
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider",
    );
  }

  return context;
}