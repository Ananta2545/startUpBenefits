'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { verificationApi } from '@/lib/api';
import { PageLoader } from '@/components/Loaders';

interface VerificationRequest {
    _id: string;
    companyName: string;
    companyWebsite?: string;
    companyDescription: string;
    foundingYear?: number;
    teamSize?: string;
    linkedinUrl?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
}

interface User {
    _id: string;
    name: string;
    email: string;
    companyName?: string;
    isVerified: boolean;
    createdAt: string;
}

type Tab = 'requests' | 'users';

export default function AdminPage() {
    const router = useRouter();
    const { user, loading: authLoading, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('requests');
    const hasFetched = useRef(false);

    // Requests state
    const [requests, setRequests] = useState<VerificationRequest[]>([]);
    const [requestsLoading, setRequestsLoading] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
    const [processing, setProcessing] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    // Users state
    const [users, setUsers] = useState<User[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [userStats, setUserStats] = useState({ total: 0, verified: 0, unverified: 0 });
    const [userFilter, setUserFilter] = useState<'all' | 'verified' | 'unverified'>('all');

    // Initial data loaded flag
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
        if (!authLoading && user && user.role !== 'admin') {
            router.push('/dashboard');
        }
    }, [authLoading, user, router]);

    // Fetch all data once when user is confirmed admin
    useEffect(() => {
        const fetchAllData = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;

            setRequestsLoading(true);
            setUsersLoading(true);

            try {
                const [requestsRes, usersRes] = await Promise.all([
                    verificationApi.getAllRequests({ status: 'pending' }),
                    verificationApi.getAllUsers({})
                ]);
                setRequests(requestsRes.data.data);
                setUsers(usersRes.data.data);
                setUserStats(usersRes.data.stats);
            } catch (err) {
                console.error('Failed to fetch data');
            } finally {
                setRequestsLoading(false);
                setUsersLoading(false);
                setDataLoaded(true);
            }
        };

        if (!authLoading && user?.role === 'admin') {
            fetchAllData();
        }
    }, [authLoading, user]);

    // Refetch users when filter changes (only after initial load)
    useEffect(() => {
        const fetchUsers = async () => {
            if (!dataLoaded) return;
            setUsersLoading(true);
            try {
                const params = userFilter === 'all' ? {} : { isVerified: userFilter === 'verified' ? 'true' : 'false' };
                const response = await verificationApi.getAllUsers(params);
                setUsers(response.data.data);
            } catch (err) {
                console.error('Failed to fetch users');
            } finally {
                setUsersLoading(false);
            }
        };
        fetchUsers();
    }, [userFilter, dataLoaded]);

    const handleApprove = async (requestId: string) => {
        setProcessing(requestId);
        try {
            await verificationApi.approveRequest(requestId);
            setRequests(prev => prev.filter(r => r._id !== requestId));
            setSelectedRequest(null);
            // Refresh user stats
            const response = await verificationApi.getAllUsers({});
            setUserStats(response.data.stats);
            if (userFilter === 'all') {
                setUsers(response.data.data);
            }
        } catch (err) {
            console.error('Failed to approve request');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (requestId: string) => {
        setProcessing(requestId);
        try {
            await verificationApi.rejectRequest(requestId, rejectReason);
            setRequests(prev => prev.filter(r => r._id !== requestId));
            setSelectedRequest(null);
            setShowRejectModal(false);
            setRejectReason('');
        } catch (err) {
            console.error('Failed to reject request');
        } finally {
            setProcessing(null);
        }
    };

    if (authLoading) return <PageLoader />;
    if (!user || user.role !== 'admin') return <PageLoader />;

    return (
        <div className="min-h-screen px-6 py-12">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-4xl font-bold">
                            <span className="gradient-text">Admin Panel</span>
                        </h1>
                        <p className="text-zinc-500">Manage verification requests and users</p>
                    </div>
                    <button onClick={logout} className="btn-secondary text-sm">
                        Logout
                    </button>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-zinc-900 rounded-xl border border-amber-500/30 p-5 text-center">
                        <p className="text-3xl font-bold text-amber-500">{requests.length}</p>
                        <p className="text-sm text-zinc-400">Pending Requests</p>
                    </div>
                    <div className="bg-zinc-900 rounded-xl border border-emerald-500/30 p-5 text-center">
                        <p className="text-3xl font-bold text-emerald-500">{userStats.verified}</p>
                        <p className="text-sm text-zinc-400">Verified Users</p>
                    </div>
                    <div className="bg-zinc-900 rounded-xl border border-zinc-700 p-5 text-center">
                        <p className="text-3xl font-bold text-zinc-400">{userStats.unverified}</p>
                        <p className="text-sm text-zinc-400">Unverified Users</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'requests'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                    >
                        Pending Requests ({requests.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'users'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-zinc-800 text-zinc-400 hover:text-white'
                            }`}
                    >
                        All Users ({userStats.total})
                    </button>
                </div>

                {/* Pending Requests Tab */}
                {activeTab === 'requests' && (
                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Requests List */}
                        <div>
                            {requestsLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                                            <div className="h-5 w-40 skeleton rounded mb-2" />
                                            <div className="h-4 w-32 skeleton rounded" />
                                        </div>
                                    ))}
                                </div>
                            ) : requests.length === 0 ? (
                                <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
                                    <div className="text-4xl mb-3">✅</div>
                                    <p className="text-zinc-400">No pending requests</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {requests.map((request) => (
                                        <motion.button
                                            key={request._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            onClick={() => setSelectedRequest(request)}
                                            className={`w-full text-left bg-zinc-900 rounded-xl border p-4 transition-all ${selectedRequest?._id === request._id
                                                ? 'border-indigo-500'
                                                : 'border-zinc-800 hover:border-zinc-700'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-medium">{request.companyName}</h3>
                                                <span className="badge badge-pending">pending</span>
                                            </div>
                                            <p className="text-sm text-zinc-400">{request.user.name}</p>
                                            <p className="text-xs text-zinc-500">{request.user.email}</p>
                                        </motion.button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Request Details */}
                        <div>
                            {selectedRequest ? (
                                <motion.div
                                    key={selectedRequest._id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 sticky top-28"
                                >
                                    <h2 className="text-xl font-bold mb-1">{selectedRequest.companyName}</h2>
                                    <p className="text-sm text-zinc-400 mb-6">{selectedRequest.user.email}</p>

                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <p className="text-xs text-zinc-500 mb-1">Description</p>
                                            <p className="text-sm text-zinc-300">{selectedRequest.companyDescription}</p>
                                        </div>

                                        {selectedRequest.companyWebsite && (
                                            <div>
                                                <p className="text-xs text-zinc-500 mb-1">Website</p>
                                                <a href={selectedRequest.companyWebsite} target="_blank" rel="noopener noreferrer"
                                                    className="text-sm text-indigo-400 hover:underline">
                                                    {selectedRequest.companyWebsite}
                                                </a>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            {selectedRequest.foundingYear && (
                                                <div>
                                                    <p className="text-xs text-zinc-500 mb-1">Founded</p>
                                                    <p className="text-sm">{selectedRequest.foundingYear}</p>
                                                </div>
                                            )}
                                            {selectedRequest.teamSize && (
                                                <div>
                                                    <p className="text-xs text-zinc-500 mb-1">Team Size</p>
                                                    <p className="text-sm">{selectedRequest.teamSize}</p>
                                                </div>
                                            )}
                                        </div>

                                        {selectedRequest.linkedinUrl && (
                                            <div>
                                                <p className="text-xs text-zinc-500 mb-1">LinkedIn</p>
                                                <a href={selectedRequest.linkedinUrl} target="_blank" rel="noopener noreferrer"
                                                    className="text-sm text-indigo-400 hover:underline">
                                                    View Profile →
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-3 pt-4 border-t border-zinc-800">
                                        <button
                                            onClick={() => handleApprove(selectedRequest._id)}
                                            disabled={processing === selectedRequest._id}
                                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                                        >
                                            {processing === selectedRequest._id ? 'Processing...' : '✓ Approve'}
                                        </button>
                                        <button
                                            onClick={() => setShowRejectModal(true)}
                                            disabled={processing === selectedRequest._id}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                                        >
                                            ✕ Reject
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-12 text-center">
                                    <div className="text-5xl mb-4">📋</div>
                                    <p className="text-zinc-500">Select a request to review</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div>
                        {/* Filters */}
                        <div className="flex gap-2 mb-4">
                            {(['all', 'verified', 'unverified'] as const).map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setUserFilter(filter)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${userFilter === filter
                                        ? 'bg-zinc-700 text-white'
                                        : 'bg-zinc-800/50 text-zinc-400 hover:text-white'
                                        }`}
                                >
                                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Users Table */}
                        {usersLoading ? (
                            <div className="space-y-2">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="bg-zinc-900 rounded-lg p-4">
                                        <div className="h-4 w-48 skeleton rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : users.length === 0 ? (
                            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
                                <p className="text-zinc-400">No users found</p>
                            </div>
                        ) : (
                            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-zinc-800/50">
                                        <tr>
                                            <th className="text-left text-xs font-medium text-zinc-400 px-4 py-3">User</th>
                                            <th className="text-left text-xs font-medium text-zinc-400 px-4 py-3">Company</th>
                                            <th className="text-left text-xs font-medium text-zinc-400 px-4 py-3">Status</th>
                                            <th className="text-left text-xs font-medium text-zinc-400 px-4 py-3">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr key={u._id} className="border-t border-zinc-800">
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-sm">{u.name}</p>
                                                    <p className="text-xs text-zinc-500">{u.email}</p>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-zinc-400">
                                                    {u.companyName || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`badge ${u.isVerified ? 'badge-approved' : 'badge-pending'}`}>
                                                        {u.isVerified ? 'Verified' : 'Unverified'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-zinc-500">
                                                    {new Date(u.createdAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {showRejectModal && selectedRequest && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 max-w-md w-full"
                    >
                        <h3 className="text-lg font-semibold mb-4">Reject Request</h3>
                        <p className="text-sm text-zinc-400 mb-4">
                            Rejecting <strong>{selectedRequest.companyName}</strong>
                        </p>
                        <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="input-field min-h-[100px] mb-4"
                            placeholder="Reason for rejection (optional)"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                                className="flex-1 btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleReject(selectedRequest._id)}
                                disabled={processing === selectedRequest._id}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {processing ? 'Rejecting...' : 'Confirm'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
