import React from 'react';

export default function Loading() {
    return (
        <div className="flex h-[70vh] w-full flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
            <div className="relative flex items-center justify-center">
                {/* Outer spin rings */}
                <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-t-transparent dark:border-blue-400 dark:border-t-transparent opacity-30"></div>
                <div className="absolute h-12 w-12 animate-spin rounded-full border-4 border-solid border-red-600 border-b-transparent dark:border-red-400 dark:border-b-transparent animation-delay-150"></div>
                <div className="h-8 w-8 animate-pulse rounded-full bg-[var(--color-primary)] opacity-50"></div>
            </div>

            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 max-w-[200px] text-center animate-pulse">
                Chargement en cours, veuillez patienter quelques instants...
            </p>
        </div>
    );
}
