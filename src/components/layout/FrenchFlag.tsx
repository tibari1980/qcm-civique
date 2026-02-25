'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function FrenchFlag({ className = "" }: { className?: string }) {
    return (
        <motion.div
            className={`relative overflow-hidden shadow-2xl rounded-sm ${className}`}
            initial={{ rotate: -2, scale: 0.9, opacity: 0 }}
            animate={{ rotate: 1, scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            aria-hidden="true"
            role="presentation"
        >
            {/* Animated waving effect using SVG filters if needed, but a simple skew/float is better for perf */}
            <motion.div
                className="w-full h-full flex"
                animate={{
                    skewY: [0, 1, 0, -1, 0],
                    y: [0, -2, 0, 2, 0]
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <div className="flex-1 h-full bg-[#002395]" />
                <div className="flex-1 h-full bg-white relative">
                    {/* Subtle texture/sheen overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/5" />
                </div>
                <div className="flex-1 h-full bg-[#ed2939]" />
            </motion.div>

            {/* Shadow/Gloss effect */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-black/10 via-transparent to-white/10" />
        </motion.div>
    );
}
