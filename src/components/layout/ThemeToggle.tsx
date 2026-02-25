'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeMode } from '@/context/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

const MODES: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Automatique', icon: Monitor },
];

export function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen]);

    const CurrentIcon = resolvedTheme === 'dark' ? Moon : Sun;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
                aria-label={`Thème actuel : ${MODES.find(m => m.value === theme)?.label}. Cliquer pour changer.`}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <CurrentIcon className="h-5 w-5" aria-hidden="true" />
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[180px] z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    role="listbox"
                    aria-label="Choisir le mode d'affichage"
                >
                    {MODES.map((mode) => {
                        const Icon = mode.icon;
                        const isActive = theme === mode.value;
                        return (
                            <button
                                key={mode.value}
                                onClick={() => {
                                    setTheme(mode.value);
                                    setIsOpen(false);
                                }}
                                role="option"
                                aria-selected={isActive}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${isActive
                                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                <Icon className="h-4 w-4" aria-hidden="true" />
                                <span>{mode.label}</span>
                                {isActive && (
                                    <span className="ml-auto text-blue-600 dark:text-blue-400" aria-hidden="true">✓</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
