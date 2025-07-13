'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Translation {
  id: string;
  key: string;
  value: string;
  language: string;
  category: string;
}

interface TranslationCache {
  [key: string]: {
    data: Translation[];
    timestamp: number;
  };
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos en milisegundos
const cache: TranslationCache = {};

export function useTranslations(category?: string, language: string = 'es') {
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getCacheKey = useCallback((cat?: string, lang: string = 'es') => {
    return cat ? `${cat}-${lang}` : `all-${lang}`;
  }, []);

  const isValidCache = useCallback((cacheEntry: { data: Translation[]; timestamp: number }) => {
    return Date.now() - cacheEntry.timestamp < CACHE_TTL;
  }, []);

  const fetchTranslations = useCallback(async (cat?: string, lang: string = 'es') => {
    const cacheKey = getCacheKey(cat, lang);
    
    // Verificar cache
    if (cache[cacheKey] && isValidCache(cache[cacheKey])) {
      return cache[cacheKey].data;
    }

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo controlador
    abortControllerRef.current = new AbortController();

    try {
      const params = new URLSearchParams();
      if (cat) params.append('category', cat);
      params.append('language', lang);

      const response = await fetch(`/api/translations/public?${params.toString()}`, {
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error('Error al cargar traducciones');
      }

      const data = await response.json();
      
      // Actualizar cache
      cache[cacheKey] = {
        data: data.translations || [],
        timestamp: Date.now()
      };

      return data.translations || [];
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return [];
      }
      throw err;
    }
  }, [getCacheKey, isValidCache]);

  const loadTranslations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchTranslations(category, language);
      setTranslations(data);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
      setTranslations([]);
    } finally {
      setLoading(false);
    }
  }, [category, language, fetchTranslations]);

  useEffect(() => {
    loadTranslations();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadTranslations]);

  const translate = useCallback((key: string, defaultValue?: string) => {
    const translation = translations.find(t => t.key === key);
    return translation?.value || defaultValue || key;
  }, [translations]);

  const translateMany = useCallback((keys: string[]): Record<string, string> => {
    const result: Record<string, string> = {};
    
    keys.forEach(key => {
      const translation = translations.find(t => t.key === key);
      result[key] = translation?.value || key;
    });

    return result;
  }, [translations]);

  const translateArray = useCallback(<T extends { [K in keyof T]: any }>(
    items: T[],
    fields: (keyof T)[]
  ): T[] => {
    return items.map(item => {
      const translatedItem = { ...item };
      
      fields.forEach(field => {
        const key = String(item[field]);
        const translation = translations.find(t => t.key === key);
        if (translation) {
          translatedItem[field] = translation.value as T[typeof field];
        }
      });

      return translatedItem;
    });
  }, [translations]);

  const clearCache = useCallback(() => {
    Object.keys(cache).forEach(key => delete cache[key]);
  }, []);

  const refreshTranslations = useCallback(async () => {
    const cacheKey = getCacheKey(category, language);
    delete cache[cacheKey];
    await loadTranslations();
  }, [category, language, getCacheKey, loadTranslations]);

  return {
    translations,
    translate,
    translateMany,
    translateArray,
    loading,
    error,
    clearCache,
    refresh: refreshTranslations
  };
}

// Hook específico para traducciones de productos
export function useProductTranslations(language: string = 'es') {
  return useTranslations('products', language);
}

// Hook específico para traducciones de categorías
export function useCategoryTranslations(language: string = 'es') {
  return useTranslations('categories', language);
}

// Hook específico para traducciones generales
export function useGeneralTranslations(language: string = 'es') {
  return useTranslations('general', language);
}

// Hook para traducir un solo valor
export function useTranslation(key: string, category?: string, defaultValue?: string, language: string = 'es') {
  const { translate, loading } = useTranslations(category, language);
  const [value, setValue] = useState(defaultValue || key);

  useEffect(() => {
    if (!loading) {
      setValue(translate(key, defaultValue));
    }
  }, [key, defaultValue, translate, loading]);

  return value;
}

// Hook para compatibilidad con el código existente
export function useTranslationsLegacy(category: string = 'categories') {
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { translate, translateMany, loading: hookLoading } = useTranslations(category);

  // Función para obtener traducciones para un array de textos
  const translateTexts = useCallback(async (texts: string[]): Promise<void> => {
    if (texts.length === 0) return;
    
    setLoading(true);
    try {
      const result = translateMany(texts);
      setTranslations(prev => ({ ...prev, ...result }));
    } finally {
      setLoading(false);
    }
  }, [translateMany]);

  // Función para obtener una traducción (devuelve original si no existe traducción)
  const getTranslation = useCallback((text: string): string => {
    return translations[text] || translate(text) || text;
  }, [translations, translate]);

  useEffect(() => {
    setLoading(hookLoading);
  }, [hookLoading]);

  return {
    translations,
    loading,
    translateTexts,
    getTranslation
  };
}