'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { ButtonLoader } from '@/components/Loaders';

export default function RegisterPage() {
    const router = useRouter();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        companyName: '',
        companySize: '1-10'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            setLoading(false);
            return;
        }

        try {
            await register(formData);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                    <p className="text-zinc-500">Start saving on premium tools</p>
                </div>

                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2">Full Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input-field"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input-field"
                                placeholder="you@company.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="input-field"
                                placeholder="••••••••"
                            />
                            <p className="text-xs text-zinc-500 mt-1">Minimum 6 characters</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Company Name <span className="text-zinc-500">(optional)</span></label>
                            <input
                                type="text"
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                className="input-field"
                                placeholder="Acme Inc"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Team Size</label>
                            <select
                                value={formData.companySize}
                                onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                                className="input-field"
                            >
                                <option value="1-10">1-10 people</option>
                                <option value="11-50">11-50 people</option>
                                <option value="51-200">51-200 people</option>
                                <option value="200+">200+ people</option>
                            </select>
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 flex items-center justify-center"
                        >
                            {loading ? <ButtonLoader /> : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-zinc-500 text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="text-indigo-400 hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="text-xs text-zinc-600 text-center mt-6">
                    By creating an account, you agree to our Terms of Service
                </p>
            </motion.div>
        </div>
    );
}
