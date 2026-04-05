'use client';

import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    circle?: boolean;
}

export const Skeleton = ({ className = '', width, height, circle = false }: SkeletonProps) => {
    return (
        <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }}
            className={`bg-gray-200 rounded-md ${className} ${circle ? 'rounded-full' : ''}`}
            style={{
                width: width ?? '100%',
                height: height ?? '1rem',
            }}
            aria-hidden="true"
        />
    );
};

export const CardSkeleton = () => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <Skeleton width="40%" height="1.25rem" className="mb-2" />
        <Skeleton width="100%" height="3rem" />
        <div className="flex justify-between items-center pt-2">
            <Skeleton width="30%" height="1rem" />
            <Skeleton width="2rem" height="2rem" circle />
        </div>
    </div>
);

export const StatsCardSkeleton = () => (
    <div className="premium-card-3d border-none bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2">
            <Skeleton width="40%" height="0.75rem" />
            <Skeleton width="2.5rem" height="2.5rem" className="rounded-xl" />
        </div>
        <div>
            <Skeleton width="60%" height="2.5rem" className="mb-2" />
            <Skeleton width="50%" height="1rem" />
        </div>
    </div>
);
