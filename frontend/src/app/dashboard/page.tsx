'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { claimsApi } from '@/lib/api';
import { PageLoader } from '@/components/Loaders';

interface Claim {
    _id: string;
    status: string;
    claimCode?: string;
    createdAt: string;
    deal: {
        _id: string;
        title: string;
        partner: { name: string };
        category: string;
        discountValue: string;
    };
}

interface Stats {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
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

export default function DashboardPage() {
    const router = useRouter();
    const { user, loading: authLoading, logout } = useAuth();
    const [claims, setClaims] = useState<Claim[]>([]);
    const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(false);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
        // Redirect admin to admin panel
        if (!authLoading && user?.role === 'admin') {
            router.push('/admin');
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        const fetchData = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;
            setLoading(true);
            try {
                const [claimsRes, statsRes] = await Promise.all([
                    claimsApi.getAll(),
                    claimsApi.getStats()
                ]);
                setClaims(claimsRes.data.data);
                setStats(statsRes.data.data);
            } catch (err) {
                console.log('Failed to fetch claims');
            } finally {
                setLoading(false);
            }
        };
        if (!authLoading && user && user.role !== 'admin') {
            fetchData();
        }
    }, [authLoading, user]);

    if (authLoading) return <PageLoader />;
    if (!user) return <PageLoader />;

    return (
        <div className="min-h-screen px-6 py-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <h1 className="text-4xl font-bold mb-2">
                        Hello, <span className="gradient-text">{user.name.split(' ')[0]}</span> 👋
                    </h1>
                    <p className="text-zinc-500">Manage your claimed deals and profile</p>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Sidebar - Profile */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-1"
                    >
                        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 sticky top-28">
                            {/* Profile Card */}
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold mx-auto mb-4">
                                    {user.name.charAt(0)}
                                </div>
                                <h3 className="text-xl font-semibold">{user.name}</h3>
                                <p className="text-zinc-500 text-sm">{user.email}</p>

                                {/* Verification Badge */}
                                <div className="mt-3">
                                    {user.isVerified ? (
                                        <span className="badge badge-approved">
                                            ✓ Verified
                                        </span>
                                    ) : (
                                        <span className="badge badge-pending">
                                            Unverified
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Profile Details */}
                            <div className="space-y-4 pt-6 border-t border-zinc-800">
                                {user.companyName && (
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1">Company</p>
                                        <p className="text-sm">{user.companyName}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-zinc-500 mb-1">Member Since</p>
                                    <p className="text-sm">
                                        {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', {
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-6 pt-6 border-t border-zinc-800 space-y-3">
                                <Link href="/deals" className="btn-primary w-full text-center block">
                                    Browse Deals
                                </Link>
                                <button
                                    onClick={logout}
                                    className="btn-secondary w-full"
                                >
                                    Sign Out
                                </button>
                            </div>

                            {!user.isVerified && (
                                <Link href="/verify" className="block mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl hover:bg-amber-500/20 transition-colors">
                                    <p className="text-sm text-amber-500">
                                        <strong>Get Verified →</strong><br />
                                        <span className="text-amber-500/80">Verify your startup to unlock exclusive deals</span>
                                    </p>
                                </Link>
                            )}
                        </div>
                    </motion.div>

                    {/* Main Content - Claims */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        {/* Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[
                                { label: 'Total Claims', value: stats.total, color: 'text-white' },
                                { label: 'Pending', value: stats.pending, color: 'text-amber-500' },
                                { label: 'Approved', value: stats.approved, color: 'text-emerald-500' },
                                { label: 'Rejected', value: stats.rejected, color: 'text-red-500' },
                            ].map((stat) => (
                                <div key={stat.label} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 text-center">
                                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                    <p className="text-xs text-zinc-500">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Claims List */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Your Claims</h2>

                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 skeleton rounded-xl" />
                                                <div className="flex-1">
                                                    <div className="h-5 w-48 skeleton rounded mb-2" />
                                                    <div className="h-4 w-32 skeleton rounded" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : claims.length === 0 ? (
                                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-12 text-center">
                                    <div className="text-5xl mb-4">📭</div>
                                    <h3 className="text-lg font-semibold mb-2">No claims yet</h3>
                                    <p className="text-zinc-500 mb-6">Start exploring deals to save on premium tools</p>
                                    <Link href="/deals" className="btn-primary">
                                        Explore Deals
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {claims.filter(claim => claim.deal).map((claim, index) => {
                                        const gradientColor = categoryColors[claim.deal.category] || 'from-gray-500 to-gray-600';
                                        return (
                                            <motion.div
                                                key={claim._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Link href={`/deals/${claim.deal._id}`}>
                                                    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 hover:border-zinc-700 transition-all group">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center text-white font-bold flex-shrink-0`}>
                                                                {claim.deal.partner.name.charAt(0)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-medium text-white group-hover:text-indigo-400 transition-colors truncate">
                                                                    {claim.deal.title}
                                                                </h4>
                                                                <p className="text-sm text-zinc-500">
                                                                    {claim.deal.partner.name} • {claim.deal.discountValue}
                                                                </p>
                                                            </div>
                                                            <div className="text-right flex-shrink-0">
                                                                <span className={`badge ${claim.status === 'approved' ? 'badge-approved' :
                                                                    claim.status === 'rejected' ? 'badge-rejected' : 'badge-pending'
                                                                    }`}>
                                                                    {claim.status}
                                                                </span>
                                                                {claim.claimCode && (
                                                                    <p className="text-xs text-zinc-500 mt-1 font-mono">
                                                                        {claim.claimCode}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
