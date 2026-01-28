'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/deals', label: 'Deals' },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 glass"
        >
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg transition-transform group-hover:scale-110">
                            SB
                        </div>
                        <span className="text-xl font-semibold hidden sm:block">
                            Startup<span className="gradient-text">Benefits</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`relative py-2 text-sm font-medium transition-colors ${isActive(link.href)
                                    ? 'text-white'
                                    : 'text-zinc-400 hover:text-white'
                                    }`}
                            >
                                {link.label}
                                {isActive(link.href) && (
                                    <motion.div
                                        layoutId="navbar-indicator"
                                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600"
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        {loading ? (
                            <div className="w-20 h-10 skeleton rounded-lg" />
                        ) : user ? (
                            <>
                                {user.role === 'admin' && (
                                    <Link
                                        href="/admin"
                                        className={`text-sm font-medium transition-colors ${isActive('/admin') ? 'text-amber-500' : 'text-amber-500/70 hover:text-amber-500'
                                            }`}
                                    >
                                        Admin
                                    </Link>
                                )}
                                <Link
                                    href="/dashboard"
                                    className={`text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-white' : 'text-zinc-400 hover:text-white'
                                        }`}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={logout}
                                    className="btn-secondary text-sm py-2 px-4"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">
                                    Sign In
                                </Link>
                                <Link href="/register" className="btn-primary text-sm py-2 px-5">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2"
                    >
                        <div className="w-6 h-5 flex flex-col justify-between">
                            <span className={`block h-0.5 w-full bg-white transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                            <span className={`block h-0.5 w-full bg-white transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                            <span className={`block h-0.5 w-full bg-white transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                        </div>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden mt-4 pb-4 border-t border-zinc-800"
                    >
                        <div className="flex flex-col gap-4 pt-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`text-sm font-medium ${isActive(link.href) ? 'text-white' : 'text-zinc-400'}`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {user ? (
                                <>
                                    {user.role === 'admin' && (
                                        <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="text-sm text-amber-500">
                                            Admin Panel
                                        </Link>
                                    )}
                                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm text-zinc-400">
                                        Dashboard
                                    </Link>
                                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-sm text-zinc-400 text-left">
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm text-zinc-400">
                                        Sign In
                                    </Link>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary text-sm py-2 px-5 text-center">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.nav>
    );
}
