'use client';

import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Megaphone, X } from 'lucide-react';

export function AnnouncementBanner() {
    const { settings } = useSettings();
    const [dismissed, setDismissed] = React.useState(false);

    if (!settings.announcementActive || !settings.announcementMessage || dismissed) {
        return null;
    }

    return (
        <div className="bg-[var(--color-primary)] text-white px-4 py-2 relative overflow-hidden animate-in fade-in slide-in-from-top duration-500">
            {/* Background pattern/effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent" />
            </div>

            <div className="container mx-auto flex items-center justify-center gap-3 text-sm font-medium">
                <Megaphone className="h-4 w-4 flex-shrink-0 animate-bounce" aria-hidden="true" />
                <p className="text-center">
                    {settings.announcementMessage}
                </p>
                <button
                    onClick={() => setDismissed(true)}
                    className="ml-auto p-1 hover:bg-white/20 rounded transition-colors"
                    aria-label="Fermer l'annonce"
                >
                    <X className="h-3.3 w-3.5" />
                </button>
            </div>
        </div>
    );
}
