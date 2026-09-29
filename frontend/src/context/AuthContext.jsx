import { createContext, useContext } from "react";
import { authClient } from "../lib/auth-client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const session = authClient.useSession();

  return (
    <AuthContext.Provider value={session}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
