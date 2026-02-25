'use client';

import React from 'react';

export function TricolorBar() {
    return (
        <div className="fixed top-0 left-0 w-full h-1 z-[100] flex">
            <div className="flex-1 h-full bg-[#002395]" />
            <div className="flex-1 h-full bg-white" />
            <div className="flex-1 h-full bg-[#ed2939]" />
        </div>
    );
}
