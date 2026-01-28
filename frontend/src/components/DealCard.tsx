'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface Deal {
    _id: string;
    title: string;
    shortDescription?: string;
    partner: {
        name: string;
        logo?: string;
    };
    category: string;
    discountType: string;
    discountValue: string;
    isLocked: boolean;
    featured?: boolean;
}

interface DealCardProps {
    deal: Deal;
    index?: number;
}

const categoryColors: Record<string, string> = {
    cloud: 'from-blue-500 to-cyan-500',
    marketing: 'from-pink-500 to-rose-500',
    analytics: 'from-amber-500 to-orange-500',
    productivity: 'from-emerald-500 to-green-500',
    design: 'from-violet-500 to-purple-500',
    development: 'from-indigo-500 to-blue-500',
    finance: 'from-lime-500 to-emerald-500',
    communication: 'from-cyan-500 to-teal-500',
};

export default function DealCard({ deal, index = 0 }: DealCardProps) {
    const gradientColor = categoryColors[deal.category] || 'from-gray-500 to-gray-600';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            whileHover={{ y: -4 }}
            className="relative group"
        >
            <Link href={`/deals/${deal._id}`}>
                <div className={`relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-300 group-hover:border-zinc-700 ${deal.isLocked ? 'opacity-90' : ''}`}>
                    {/* Top Gradient Bar */}
                    <div className={`h-1 bg-gradient-to-r ${gradientColor}`} />

                    {/* Content */}
                    <div className="p-6">
                        {/* Badges Row */}
                        <div className="flex items-center justify-between mb-4">
                            {/* Locked Badge */}
                            {deal.isLocked ? (
                                <span className="px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-500 rounded-md flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    Verified Only
                                </span>
                            ) : (
                                <div></div>
                            )}

                            {/* Featured Badge */}
                            {deal.featured && (
                                <span className="px-2 py-1 text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 rounded-md text-white">
                                    Featured
                                </span>
                            )}
                        </div>

                        {/* Partner Logo & Category */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                                {deal.partner.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm text-zinc-300 truncate">{deal.partner.name}</p>
                                <span className="text-xs text-zinc-500 capitalize">{deal.category}</span>
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                            {deal.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
                            {deal.shortDescription || deal.title}
                        </p>

                        {/* Discount Value */}
                        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                            <div>
                                <p className="text-xs text-zinc-500 mb-1">Deal Value</p>
                                <p className={`text-xl font-bold bg-gradient-to-r ${gradientColor} bg-clip-text text-transparent`}>
                                    {deal.discountValue}
                                </p>
                            </div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-zinc-800 group-hover:bg-gradient-to-r ${gradientColor} transition-all duration-300`}>
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Hover Glow Effect */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${gradientColor} transition-opacity duration-300 pointer-events-none`} />
                </div>
            </Link>
        </motion.div>
    );
}
