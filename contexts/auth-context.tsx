import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type RegisteredUser = {
  email: string;
  password: string;
};

type AuthContextValue = {
  register: (email: string, password: string) => { success: boolean; message?: string };
  login: (username: string, password: string) => boolean;
};

const ADMIN_USER = 'admin';
const ADMIN_PASSWORD = 'admin';

const AuthContext = createContext<AuthContextValue | null>(null);

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);

  const register = useCallback(
    (email: string, password: string): { success: boolean; message?: string } => {
      const normalizedEmail = email.trim().toLowerCase();

      if (!isValidEmail(normalizedEmail)) {
        return { success: false, message: 'Informe um e-mail válido.' };
      }

      if (password.length < 4) {
        return { success: false, message: 'A senha deve ter pelo menos 4 caracteres.' };
      }

      const alreadyExists = registeredUsers.some((user) => user.email === normalizedEmail);
      if (alreadyExists) {
        return { success: false, message: 'Este e-mail já está cadastrado.' };
      }

      setRegisteredUsers((prev) => [...prev, { email: normalizedEmail, password }]);
      return { success: true };
    },
    [registeredUsers],
  );

  const login = useCallback(
    (username: string, password: string) => {
      const normalizedUsername = username.trim().toLowerCase();

      if (normalizedUsername === ADMIN_USER && password === ADMIN_PASSWORD) {
        return true;
      }

      return registeredUsers.some(
        (user) => user.email === normalizedUsername && user.password === password,
      );
    },
    [registeredUsers],
  );

  const value = useMemo(() => ({ register, login }), [register, login]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
