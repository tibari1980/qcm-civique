'use client';

import React from 'react';

export function TricolorLogo({ className = "h-8 w-8" }: { className?: string }) {
    return (
        <div className={`relative ${className} flex items-center justify-center`}>
            {/* Background with French Tricolor */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-sm">
                <path d="M0 0 H33.3 V100 H0 Z" fill="#002395" />
                <path d="M33.3 0 H66.6 V100 H33.3 Z" fill="#FFFFFF" />
                <path d="M66.6 0 H100 V100 H66.6 Z" fill="#ED2939" />
            </svg>
            {/* Graduation Cap Icon Overlay */}
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative z-10 w-3/4 h-3/4 text-black mix-blend-multiply opacity-80"
            >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
        </div>
    );
}
