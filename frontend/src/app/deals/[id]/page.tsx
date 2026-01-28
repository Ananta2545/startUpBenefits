'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { dealsApi, claimsApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { PageLoader, ButtonLoader } from '@/components/Loaders';

interface Deal {
    _id: string;
    title: string;
    description: string;
    shortDescription?: string;
    partner: {
        name: string;
        logo?: string;
        website?: string;
        description?: string;
    };
    category: string;
    discountType: string;
    discountValue: string;
    originalPrice?: string;
    isLocked: boolean;
    eligibility: string;
    terms?: string;
    claimInstructions?: string;
    featured?: boolean;
}

interface UserClaim {
    status: string;
    claimCode?: string;
    claimedAt: string;
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

export default function DealDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [deal, setDeal] = useState<Deal | null>(null);
    const [userClaim, setUserClaim] = useState<UserClaim | null>(null);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState(false);
    const [claimSuccess, setClaimSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDeal = async () => {
            try {
                const response = await dealsApi.getById(id as string);
                setDeal(response.data.data);
                setUserClaim(response.data.userClaim);
            } catch (err) {
                setError('Deal not found');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDeal();
    }, [id]);

    const handleClaim = async () => {
        if (!user) {
            router.push('/login?redirect=/deals/' + id);
            return;
        }

        if (deal?.isLocked && !user.isVerified) {
            setError('You need to verify your account to claim this deal');
            return;
        }

        setClaiming(true);
        setError('');

        try {
            await claimsApi.create(id as string);
            setClaimSuccess(true);
            setUserClaim({ status: 'pending', claimedAt: new Date().toISOString() });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to claim deal');
        } finally {
            setClaiming(false);
        }
    };

    if (loading) return <PageLoader />;
    if (error && !deal) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h1 className="text-2xl font-bold mb-2">Deal not found</h1>
                    <p className="text-zinc-500 mb-6">The deal you're looking for doesn't exist</p>
                    <Link href="/deals" className="btn-primary">
                        Browse Deals
                    </Link>
                </div>
            </div>
        );
    }

    if (!deal) return null;

    const gradientColor = categoryColors[deal.category] || 'from-gray-500 to-gray-600';
    const canClaim = !userClaim && (!deal.isLocked || (user?.isVerified));

    return (
        <div className="min-h-screen px-6 py-12">
            <div className="max-w-4xl mx-auto">
                {/* Breadcrumb */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link href="/deals" className="text-zinc-500 hover:text-white transition-colors inline-flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Deals
                    </Link>
                </motion.div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden"
                >
                    {/* Header */}
                    <div className={`h-2 bg-gradient-to-r ${gradientColor}`} />

                    <div className="p-8 md:p-10">
                        {/* Badges */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${gradientColor} text-white capitalize`}>
                                {deal.category}
                            </span>
                            {deal.featured && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-500">
                                    Featured
                                </span>
                            )}
                            {deal.isLocked && (
                                <span className="badge badge-locked flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                    </svg>
                                    Verified Only
                                </span>
                            )}
                        </div>

                        {/* Partner Info */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradientColor} flex items-center justify-center text-white font-bold text-2xl`}>
                                {deal.partner.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{deal.partner.name}</h3>
                                {deal.partner.website && (
                                    <a
                                        href={deal.partner.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-indigo-400 hover:underline"
                                    >
                                        Visit Website →
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Title & Description */}
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">{deal.title}</h1>
                        <p className="text-zinc-400 text-lg leading-relaxed mb-8">{deal.description}</p>

                        {/* Deal Value */}
                        <div className="glass-light rounded-xl p-6 mb-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm text-zinc-500 mb-1">Deal Value</p>
                                    <p className={`text-4xl font-bold bg-gradient-to-r ${gradientColor} bg-clip-text text-transparent`}>
                                        {deal.discountValue}
                                    </p>
                                    {deal.originalPrice && (
                                        <p className="text-sm text-zinc-500 mt-1">
                                            Original: <span className="line-through">{deal.originalPrice}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Claim Button */}
                                <div className="flex-shrink-0">
                                    {userClaim ? (
                                        <div className="text-center">
                                            <div className={`badge ${userClaim.status === 'approved' ? 'badge-approved' : userClaim.status === 'rejected' ? 'badge-rejected' : 'badge-pending'} mb-2`}>
                                                {userClaim.status}
                                            </div>
                                            {userClaim.claimCode && (
                                                <p className="text-sm text-zinc-400">Code: <span className="font-mono text-white">{userClaim.claimCode}</span></p>
                                            )}
                                        </div>
                                    ) : claimSuccess ? (
                                        <div className="text-center">
                                            <div className="text-2xl mb-2">🎉</div>
                                            <p className="text-emerald-500 font-medium">Claimed!</p>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={handleClaim}
                                            disabled={claiming || !canClaim}
                                            className={`btn-primary px-8 py-4 text-lg ${(!canClaim || claiming) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {claiming ? <ButtonLoader /> : deal.isLocked && !user?.isVerified ? 'Verification Required' : 'Claim Deal'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-400 text-sm mt-4">{error}</p>
                            )}

                            {deal.isLocked && !user && (
                                <p className="text-zinc-500 text-sm mt-4">
                                    <Link href="/login" className="text-indigo-400 hover:underline">Sign in</Link> to claim this deal
                                </p>
                            )}

                            {deal.isLocked && user && !user.isVerified && (
                                <p className="text-amber-500 text-sm mt-4">
                                    ⚠️ This deal requires account verification. Contact support to verify your startup.
                                </p>
                            )}
                        </div>

                        {/* Details Grid */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Eligibility */}
                            <div className="bg-zinc-800/50 rounded-xl p-6">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <span className="text-lg">✓</span> Eligibility
                                </h4>
                                <p className="text-zinc-400 text-sm">{deal.eligibility}</p>
                            </div>

                            {/* Terms */}
                            {deal.terms && (
                                <div className="bg-zinc-800/50 rounded-xl p-6">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <span className="text-lg">📋</span> Terms
                                    </h4>
                                    <p className="text-zinc-400 text-sm">{deal.terms}</p>
                                </div>
                            )}
                        </div>

                        {/* Claim Instructions */}
                        {deal.claimInstructions && (
                            <div className="mt-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-6">
                                <h4 className="font-semibold mb-3 text-indigo-400 flex items-center gap-2">
                                    <span className="text-lg">💡</span> How to Claim
                                </h4>
                                <p className="text-zinc-300 text-sm">{deal.claimInstructions}</p>
                            </div>
                        )}

                        {/* Partner Description */}
                        {deal.partner.description && (
                            <div className="mt-8 pt-8 border-t border-zinc-800">
                                <h4 className="font-semibold mb-3">About {deal.partner.name}</h4>
                                <p className="text-zinc-400">{deal.partner.description}</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
