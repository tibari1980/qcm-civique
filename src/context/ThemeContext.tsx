'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: ThemeMode;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'civiqquiz-theme';

function getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ThemeMode>('system');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

    // Initialize from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
        if (stored && ['light', 'dark', 'system'].includes(stored)) {
            setThemeState(stored);
        }
    }, []);

    // Apply theme to document
    const applyTheme = useCallback((mode: ThemeMode) => {
        const resolved = mode === 'system' ? getSystemTheme() : mode;
        setResolvedTheme(resolved);

        const root = document.documentElement;
        if (resolved === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        // Set color-scheme for native elements (scrollbar, inputs, etc.)
        root.style.colorScheme = resolved;
    }, []);

    // Watch for theme changes
    useEffect(() => {
        applyTheme(theme);
    }, [theme, applyTheme]);

    // Watch for system preference changes when in auto mode
    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => applyTheme('system');

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [theme, applyTheme]);

    const setTheme = useCallback((newTheme: ThemeMode) => {
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
}
