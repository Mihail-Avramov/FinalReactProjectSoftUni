import React from 'react';
import { AuthContext, useAuthState } from './useAuth';

/**
 * Компонент, който осигурява контекст за автентикация на приложението
 * Дава достъп до потребителската информация и функции за автентикация
 */
export function AuthProvider({ children }) {
  // Използваме хука от useAuth.js за да вземем всички данни и функции
  const authState = useAuthState();
  
  // Връщаме JSX само в този компонент, като използваме логиката от useAuthState
  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;