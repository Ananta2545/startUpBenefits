'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';

interface User {
    id: string;
    email: string;
    name: string;
    companyName?: string;
    companySize?: string;
    isVerified: boolean;
    role?: string;
    createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { email: string; password: string; name: string; companyName?: string }) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    const refreshUser = useCallback(async () => {
        const token = Cookies.get('token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            const response = await authApi.getMe();
            setUser(response.data.user);
        } catch (err) {
            // Token invalid or expired
            Cookies.remove('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!initialized) {
            setInitialized(true);
            refreshUser();
        }
    }, [initialized, refreshUser]);

    const login = async (email: string, password: string) => {
        const response = await authApi.login({ email, password });
        Cookies.set('token', response.data.token, { expires: 7 });
        setUser(response.data.user);
    };

    const register = async (data: { email: string; password: string; name: string; companyName?: string }) => {
        const response = await authApi.register(data);
        Cookies.set('token', response.data.token, { expires: 7 });
        setUser(response.data.user);
    };

    const logout = () => {
        Cookies.remove('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
