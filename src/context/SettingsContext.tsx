'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AdminService } from '../services/admin.service';

interface AppSettings {
    appName: string;
    brandColor: string;
    questionsPerExam: number;
    passThreshold: number;
    enableInterview: boolean;
    enableAIQCM: boolean;
    announcementMessage: string;
    announcementActive: boolean;
    contactEmail: string;
    socialInstagram: string;
    socialLinkedIn: string;
    socialTikTok: string;
    maintenanceMode: boolean;
}

const DEFAULTS: AppSettings = {
    appName: 'CiviqQuiz',
    brandColor: '#002394',
    questionsPerExam: 40,
    passThreshold: 75,
    enableInterview: true,
    enableAIQCM: true,
    announcementMessage: '',
    announcementActive: false,
    contactEmail: 'support@civiqquiz.com',
    socialInstagram: '',
    socialLinkedIn: '',
    socialTikTok: 'civiquiz',
    maintenanceMode: false,
};

interface SettingsContextType {
    settings: AppSettings;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_CACHE_KEY = 'civiqquiz-settings-cache';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(() => {
        // Instant render from localStorage cache (stale-while-revalidate)
        if (typeof window !== 'undefined') {
            try {
                const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
                if (cached) return { ...DEFAULTS, ...JSON.parse(cached) };
            } catch { /* ignore parse errors */ }
        }
        return DEFAULTS;
    });
    const [loading, setLoading] = useState(true);

    const refreshSettings = async () => {
        try {
            const raw = await AdminService.getAppSettings();
            const merged = { ...DEFAULTS, ...(raw as Partial<AppSettings>) };
            setSettings(merged);
            // Persist to localStorage for next visit
            try { localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(merged)); } catch { /* quota exceeded */ }
        } catch (err) {
            console.error('Failed to fetch settings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshSettings();
    }, []);

    // Injecter la couleur principale dans CSS
    useEffect(() => {
        if (settings.brandColor) {
            document.documentElement.style.setProperty('--color-primary', settings.brandColor);
            // Générer une version "soft" pour les fonds
            document.documentElement.style.setProperty('--color-primary-soft', `${settings.brandColor}15`);
        }
        if (settings.appName) {
            document.title = settings.appName;
        }
    }, [settings.brandColor, settings.appName]);

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within a SettingsProvider');
    return context;
}
