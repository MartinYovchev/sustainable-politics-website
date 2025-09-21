import { createContext } from 'react';
import type { AdminState, LoginRequest } from '../types/index';

export const AdminContext = createContext<AdminState & {
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => boolean;
} | undefined>(undefined);
