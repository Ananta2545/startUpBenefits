'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { verificationApi } from '@/lib/api';
import { PageLoader } from '@/components/Loaders';

interface VerificationStatus {
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    createdAt: string;
}

export default function VerifyPage() {
    const router = useRouter();
    const { user, loading: authLoading, refreshUser } = useAuth();
    const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        companyName: '',
        companyWebsite: '',
        companyDescription: '',
        foundingYear: '',
        teamSize: '',
        linkedinUrl: '',
        additionalInfo: ''
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        const checkStatus = async () => {
            if (!user) return;
            try {
                const response = await verificationApi.getStatus();
                if (response.data.isVerified) {
                    router.push('/dashboard');
                    return;
                }
                setVerificationStatus(response.data.data);
                if (user.companyName) {
                    setFormData(prev => ({ ...prev, companyName: user.companyName || '' }));
                }
            } catch (err) {
                console.error('Failed to fetch verification status');
            } finally {
                setLoading(false);
            }
        };
        if (user) checkStatus();
    }, [user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await verificationApi.submitRequest({
                companyName: formData.companyName,
                companyWebsite: formData.companyWebsite || undefined,
                companyDescription: formData.companyDescription,
                foundingYear: formData.foundingYear ? parseInt(formData.foundingYear) : undefined,
                teamSize: formData.teamSize || undefined,
                linkedinUrl: formData.linkedinUrl || undefined,
                additionalInfo: formData.additionalInfo || undefined
            });
            setSuccess(true);
            // Refresh status
            const response = await verificationApi.getStatus();
            setVerificationStatus(response.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit verification request');
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || !user || loading) return <PageLoader />;

    // Already has pending/rejected request
    if (verificationStatus) {
        return (
            <div className="min-h-screen px-6 py-12">
                <div className="max-w-lg mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 text-center"
                    >
                        {verificationStatus.status === 'pending' ? (
                            <>
                                <div className="text-6xl mb-4">⏳</div>
                                <h1 className="text-2xl font-bold mb-2">Verification Pending</h1>
                                <p className="text-zinc-400 mb-6">
                                    Your verification request is being reviewed. We&apos;ll notify you once it&apos;s processed.
                                </p>
                                <p className="text-sm text-zinc-500">
                                    Submitted on {new Date(verificationStatus.createdAt).toLocaleDateString()}
                                </p>
                                <Link href="/dashboard" className="btn-secondary mt-6 inline-block">
                                    Back to Dashboard
                                </Link>
                            </>
                        ) : (
                            <>
                                <div className="text-6xl mb-4">❌</div>
                                <h1 className="text-2xl font-bold mb-2 text-red-500">Verification Rejected</h1>
                                <p className="text-zinc-400 mb-4">
                                    Unfortunately, your verification request was not approved.
                                </p>
                                {verificationStatus.rejectionReason && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                                        <p className="text-sm text-red-400">{verificationStatus.rejectionReason}</p>
                                    </div>
                                )}
                                <p className="text-sm text-zinc-500">
                                    Please contact support at <a href="mailto:support@startupbenefits.com" className="text-indigo-400">support@startupbenefits.com</a>
                                </p>
                                <Link href="/dashboard" className="btn-secondary mt-6 inline-block">
                                    Back to Dashboard
                                </Link>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        );
    }

    // Show success message
    if (success) {
        return (
            <div className="min-h-screen px-6 py-12">
                <div className="max-w-lg mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 text-center"
                    >
                        <div className="text-6xl mb-4">🎉</div>
                        <h1 className="text-2xl font-bold mb-2">Request Submitted!</h1>
                        <p className="text-zinc-400 mb-6">
                            Thank you for submitting your verification request. Our team will review it shortly.
                        </p>
                        <Link href="/dashboard" className="btn-primary inline-block">
                            Back to Dashboard
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-6 py-12">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Header */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold mb-3">
                            <span className="gradient-text">Get Verified</span>
                        </h1>
                        <p className="text-zinc-400 text-lg">
                            Verify your startup to unlock exclusive deals
                        </p>
                    </div>

                    {/* Info Card */}
                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-6 mb-8">
                        <h3 className="font-semibold text-indigo-400 mb-2">Why get verified?</h3>
                        <ul className="text-sm text-zinc-400 space-y-2">
                            <li>✓ Access exclusive deals marked as &quot;Verified Only&quot;</li>
                            <li>✓ Get higher discounts from premium partners</li>
                            <li>✓ Priority support and early access to new deals</li>
                        </ul>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                                <p className="text-sm text-red-400">{error}</p>
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Company Name */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Company Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                    className="input-field"
                                    placeholder="Your startup name"
                                    required
                                />
                            </div>

                            {/* Company Website */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Company Website
                                </label>
                                <input
                                    type="url"
                                    value={formData.companyWebsite}
                                    onChange={(e) => setFormData({ ...formData, companyWebsite: e.target.value })}
                                    className="input-field"
                                    placeholder="https://yourcompany.com"
                                />
                            </div>

                            {/* Company Description */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    What does your startup do? <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.companyDescription}
                                    onChange={(e) => setFormData({ ...formData, companyDescription: e.target.value })}
                                    className="input-field min-h-[100px]"
                                    placeholder="Briefly describe your product or service..."
                                    maxLength={500}
                                    required
                                />
                                <p className="text-xs text-zinc-500 mt-1">{formData.companyDescription.length}/500</p>
                            </div>

                            {/* Two column layout */}
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Founding Year */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Founding Year
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.foundingYear}
                                        onChange={(e) => setFormData({ ...formData, foundingYear: e.target.value })}
                                        className="input-field"
                                        placeholder="2024"
                                        min="1900"
                                        max={new Date().getFullYear()}
                                    />
                                </div>

                                {/* Team Size */}
                                <div>
                                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                                        Team Size
                                    </label>
                                    <select
                                        value={formData.teamSize}
                                        onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="">Select...</option>
                                        <option value="1-10">1-10 employees</option>
                                        <option value="11-50">11-50 employees</option>
                                        <option value="51-200">51-200 employees</option>
                                        <option value="200+">200+ employees</option>
                                    </select>
                                </div>
                            </div>

                            {/* LinkedIn URL */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    LinkedIn Company Page (optional)
                                </label>
                                <input
                                    type="url"
                                    value={formData.linkedinUrl}
                                    onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                    className="input-field"
                                    placeholder="https://linkedin.com/company/yourcompany"
                                />
                            </div>

                            {/* Additional Info */}
                            <div>
                                <label className="block text-sm font-medium text-zinc-300 mb-2">
                                    Anything else you&apos;d like to share?
                                </label>
                                <textarea
                                    value={formData.additionalInfo}
                                    onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                                    className="input-field min-h-[80px]"
                                    placeholder="Any additional context about your startup..."
                                    maxLength={500}
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit Verification Request
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-zinc-500 text-center mt-4">
                                Verification typically takes 1-2 business days
                            </p>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
