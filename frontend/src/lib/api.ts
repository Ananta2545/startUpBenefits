import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// add auth token to requests
api.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            Cookies.remove('token');
            if (typeof window !== 'undefined' && !window.location.pathname.includes('login')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// auth
export const authApi = {
    register: (data: { email: string; password: string; name: string; companyName?: string; companySize?: string }) =>
        api.post('/auth/register', data),
    login: (data: { email: string; password: string }) =>
        api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data: { name?: string; companyName?: string; companySize?: string }) =>
        api.put('/auth/profile', data)
};

// deals
export const dealsApi = {
    getAll: (params?: { category?: string; isLocked?: string; search?: string; page?: number; limit?: number }) =>
        api.get('/deals', { params }),
    getFeatured: () => api.get('/deals/featured'),
    getCategories: () => api.get('/deals/categories'),
    getById: (id: string) => api.get(`/deals/${id}`)
};

// claims
export const claimsApi = {
    create: (dealId: string, notes?: string) =>
        api.post('/claims', { dealId, notes }),
    getAll: (params?: { status?: string; page?: number; limit?: number }) =>
        api.get('/claims', { params }),
    getStats: () => api.get('/claims/stats'),
    getById: (id: string) => api.get(`/claims/${id}`)
};

// verification
export const verificationApi = {
    submitRequest: (data: {
        companyName: string;
        companyWebsite?: string;
        companyDescription: string;
        foundingYear?: number;
        teamSize?: string;
        linkedinUrl?: string;
        additionalInfo?: string;
    }) => api.post('/verification/request', data),
    getStatus: () => api.get('/verification/status'),
    // Admin methods
    getAllRequests: (params?: { status?: string; page?: number; limit?: number }) =>
        api.get('/verification/requests', { params }),
    getAllUsers: (params?: { isVerified?: string; page?: number; limit?: number }) =>
        api.get('/verification/users', { params }),
    approveRequest: (id: string) => api.put(`/verification/approve/${id}`),
    rejectRequest: (id: string, reason?: string) => api.put(`/verification/reject/${id}`, { reason })
};

export default api;
