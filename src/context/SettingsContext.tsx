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
    appName: 'CiviQ Quiz',
    brandColor: '#002394',
    questionsPerExam: 40,
    passThreshold: 75,
    enableInterview: true,
    enableAIQCM: true,
    announcementMessage: '',
    announcementActive: false,
    contactEmail: 'support@civiqquiz.com',
    socialInstagram: 'civiqquiz',
    socialLinkedIn: '',
    socialTikTok: 'civiqquiz',
    maintenanceMode: false,
};

interface SettingsContextType {
    settings: AppSettings;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_CACHE_KEY = 'civiqquiz-settings-cache';

// Helper to migrate legacy handles (force new brand)
function migrateSettings(raw: any): AppSettings {
    const instagram = String(raw.socialInstagram || '').toLowerCase();
    const tiktok = String(raw.socialTikTok || '').toLowerCase();
    
    const settings = { ...DEFAULTS, ...raw };
    
    // Force new branding if legacy personal handles (tibari) detected or empty
    if (instagram.includes('tibari') || !instagram) {
        settings.socialInstagram = DEFAULTS.socialInstagram;
    }
    if (tiktok.includes('tibari') || !tiktok) {
        settings.socialTikTok = DEFAULTS.socialTikTok;
    }
    
    return settings;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(() => {
        // Instant render from localStorage cache (stale-while-revalidate)
        if (typeof window !== 'undefined') {
            try {
                const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
                if (cached) return migrateSettings(JSON.parse(cached));
            } catch { /* ignore parse errors */ }
        }
        return DEFAULTS;
    });
    const [loading, setLoading] = useState(true);

    const refreshSettings = async () => {
        // Add a safety timeout (5s) to prevent infinite loading if Firestore hangs
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Settings fetch timeout")), 5000)
        );

        try {
            const raw = await Promise.race([
                AdminService.getAppSettings(),
                timeoutPromise
            ]) as Record<string, unknown>;

            const migrated = migrateSettings(raw);
            setSettings(migrated);
            
            // Persist to localStorage for next visit
            try { localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(migrated)); } catch { /* quota exceeded */ }
        } catch (err) {
            console.error('Failed to fetch settings (falling back to cache/defaults):', err);
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
