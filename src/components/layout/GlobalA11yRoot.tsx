'use client';

import React from 'react';
import { useFocusManager } from "@/hooks/useFocusManager";

export function GlobalA11yRoot({ children }: { children: React.ReactNode }) {
    useFocusManager();

    return (
        <>
            {children}
            {/* Region live pour annonces NVDA globales (route changes, etc) */}
            <div className="sr-only" aria-live="polite" aria-atomic="true" id="global-announcement" />
        </>
    );
}
