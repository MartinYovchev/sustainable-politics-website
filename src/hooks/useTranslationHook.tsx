import { useContext } from 'react';
import type { TranslationContext } from '../types/index';
import { TranslationContextComponent } from '../contexts/TranslationContext';

export function useTranslation(): TranslationContext {
  const context = useContext(TranslationContextComponent);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}

export default useTranslation;
