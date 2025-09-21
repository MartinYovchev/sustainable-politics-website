import { createContext } from 'react';
import type { TranslationContext } from '../types/index';

export const TranslationContextComponent = createContext<TranslationContext | undefined>(undefined);
