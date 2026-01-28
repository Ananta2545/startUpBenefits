'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dealsApi } from '@/lib/api';
import DealCard from '@/components/DealCard';
import { DealsGridSkeleton } from '@/components/Loaders';

interface Deal {
    _id: string;
    title: string;
    shortDescription?: string;
    partner: { name: string; logo?: string };
    category: string;
    discountType: string;
    discountValue: string;
    isLocked: boolean;
    featured?: boolean;
}

interface Category {
    name: string;
    count: number;
}

const categoryLabels: Record<string, string> = {
    all: 'All Deals',
    cloud: 'Cloud',
    marketing: 'Marketing',
    analytics: 'Analytics',
    productivity: 'Productivity',
    design: 'Design',
    development: 'Development',
    finance: 'Finance',
    communication: 'Communication',
};

export default function DealsPage() {
    const [deals, setDeals] = useState<Deal[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [accessFilter, setAccessFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchDeals = useCallback(async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (selectedCategory !== 'all') params.category = selectedCategory;
            if (accessFilter === 'unlocked') params.isLocked = 'false';
            if (accessFilter === 'locked') params.isLocked = 'true';
            if (debouncedSearch) params.search = debouncedSearch;

            const response = await dealsApi.getAll(params);
            setDeals(response.data.data);
        } catch (err) {
            console.log('Failed to fetch deals');
        } finally {
            setLoading(false);
        }
    }, [selectedCategory, accessFilter, debouncedSearch]);

    const fetchCategories = async () => {
        try {
            const response = await dealsApi.getCategories();
            setCategories(response.data.data);
        } catch (err) {
            console.log('Failed to fetch categories');
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchDeals();
    }, [fetchDeals]);

    const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

    return (
        <div className="min-h-screen px-6 py-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Explore <span className="gradient-text">Deals</span>
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Discover exclusive discounts on premium SaaS tools for your startup
                    </p>
                </motion.div>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 space-y-6"
                >
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search deals, partners..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field"
                            style={{ paddingLeft: '48px' }}
                        />
                        <svg
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === 'all'
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                }`}
                        >
                            All ({totalCount})
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.name}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat.name
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                    }`}
                            >
                                {categoryLabels[cat.name] || cat.name} ({cat.count})
                            </button>
                        ))}
                    </div>

                    {/* Access Filter */}
                    <div className="flex gap-3">
                        {[
                            { value: 'all', label: 'All Access' },
                            { value: 'unlocked', label: 'Public Deals' },
                            { value: 'locked', label: 'Verified Only' },
                        ].map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => setAccessFilter(filter.value as 'all' | 'unlocked' | 'locked')}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${accessFilter === filter.value
                                    ? 'bg-zinc-700 text-white'
                                    : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-800'
                                    }`}
                            >
                                {filter.value === 'locked' && (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Results */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <DealsGridSkeleton />
                        </motion.div>
                    ) : deals.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-20"
                        >
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold mb-2">No deals found</h3>
                            <p className="text-zinc-500">Try adjusting your filters or search query</p>
                            <button
                                onClick={() => {
                                    setSelectedCategory('all');
                                    setAccessFilter('all');
                                    setSearchQuery('');
                                }}
                                className="btn-secondary mt-6"
                            >
                                Clear Filters
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <p className="text-sm text-zinc-500 mb-6">
                                Showing {deals.length} deal{deals.length !== 1 ? 's' : ''}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {deals.map((deal, index) => (
                                    <DealCard key={deal._id} deal={deal} index={index} />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
