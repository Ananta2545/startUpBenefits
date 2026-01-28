'use client';

import { motion } from 'framer-motion';

export function DealCardSkeleton() {
    return (
        <div className="rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
            <div className="h-1 skeleton" />
            <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl skeleton" />
                    <div className="flex-1">
                        <div className="h-4 w-24 skeleton rounded mb-2" />
                        <div className="h-3 w-16 skeleton rounded" />
                    </div>
                </div>
                <div className="h-6 w-full skeleton rounded mb-2" />
                <div className="h-4 w-3/4 skeleton rounded mb-4" />
                <div className="pt-4 border-t border-zinc-800 flex justify-between items-center">
                    <div>
                        <div className="h-3 w-16 skeleton rounded mb-2" />
                        <div className="h-7 w-24 skeleton rounded" />
                    </div>
                    <div className="w-10 h-10 rounded-full skeleton" />
                </div>
            </div>
        </div>
    );
}

export function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-3 border-zinc-700 border-t-indigo-500 rounded-full"
            />
        </div>
    );
}

export function ButtonLoader() {
    return (
        <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
        />
    );
}

export function DealsGridSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
                <DealCardSkeleton key={i} />
            ))}
        </div>
    );
}
