'use client';

import React from 'react';
import Image from 'next/image';

export function TricolorLogo({ className = "h-8 w-8" }: { className?: string }) {
    return (
        <div className={`relative ${className} flex items-center justify-center`}>
            <Image
                src="/logo-civiqquiz.png"
                alt="Logo CiviqQuiz"
                width={80}
                height={80}
                className="w-full h-full object-contain"
                priority
            />
        </div>
    );
}
