/**
 * API 服务层
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL, TOKEN_KEY } from '../config';
import { ApiResponse, User, Vehicle, Post, Comment, StoreItem, Order } from '../types';

// 创建 axios 实例
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 请求拦截器 - 添加 Token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 响应拦截器 - 统一错误处理
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ message?: string }>) => {
        if (error.response?.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ========== 认证 API ==========

export const authApi = {
    register: async (username: string, password: string): Promise<ApiResponse<User & { token: string }>> => {
        const { data } = await api.post('/auth/register', { username, password });
        return data;
    },

    login: async (username: string, password: string): Promise<ApiResponse<User & { token: string }>> => {
        const { data } = await api.post('/auth/login', { username, password });
        return data;
    },

    getMe: async (): Promise<ApiResponse<User>> => {
        const { data } = await api.get('/auth/me');
        return data;
    },
};

// ========== 设备 API ==========

export const vehicleApi = {
    getAll: async (type?: string): Promise<ApiResponse<Vehicle[]>> => {
        const params = type && type !== 'all' ? { type } : {};
        const { data } = await api.get('/vehicles', { params });
        return data;
    },

    getOne: async (id: number): Promise<ApiResponse<Vehicle>> => {
        const { data } = await api.get(`/vehicles/${id}`);
        return data;
    },

    reserve: async (id: number): Promise<ApiResponse<Vehicle>> => {
        const { data } = await api.post(`/vehicles/${id}/reserve`);
        return data;
    },

    release: async (id: number): Promise<ApiResponse<Vehicle>> => {
        const { data } = await api.post(`/vehicles/${id}/release`);
        return data;
    },
};

// ========== 帖子 API ==========

export const postApi = {
    getAll: async (): Promise<ApiResponse<Post[]>> => {
        const { data } = await api.get('/posts');
        return data;
    },

    create: async (content: string, image?: string): Promise<ApiResponse<Post>> => {
        const { data } = await api.post('/posts', { content, image });
        return data;
    },

    toggleLike: async (id: number): Promise<ApiResponse<{ isLiked: boolean; likesCount: number }>> => {
        const { data } = await api.post(`/posts/${id}/like`);
        return data;
    },

    getComments: async (postId: number): Promise<ApiResponse<Comment[]>> => {
        const { data } = await api.get(`/posts/${postId}/comments`);
        return data;
    },

    addComment: async (postId: number, content: string): Promise<ApiResponse<Comment>> => {
        const { data } = await api.post(`/posts/${postId}/comment`, { content });
        return data;
    },
};

// ========== 商城 API ==========

export const storeApi = {
    getItems: async (category?: string): Promise<ApiResponse<StoreItem[]>> => {
        const params = category && category !== 'all' ? { category } : {};
        const { data } = await api.get('/store/items', { params });
        return data;
    },

    createOrder: async (items: { item_id: number; quantity: number }[]): Promise<ApiResponse<Order>> => {
        const { data } = await api.post('/store/orders', { items });
        return data;
    },

    getOrders: async (): Promise<ApiResponse<Order[]>> => {
        const { data } = await api.get('/store/orders');
        return data;
    },
};

// ========== 用户 API ==========

export const userApi = {
    getProfile: async (): Promise<ApiResponse<User>> => {
        const { data } = await api.get('/users/profile');
        return data;
    },

    getStats: async (): Promise<ApiResponse<{ operationTime: number; earnings: number; tasksCompleted: number }>> => {
        const { data } = await api.get('/users/stats');
        return data;
    },

    recharge: async (amount: number): Promise<ApiResponse<{ coins: number }>> => {
        const { data } = await api.post('/users/recharge', { amount });
        return data;
    },

    toggleFollow: async (userId: number): Promise<ApiResponse<{ isFollowing: boolean }>> => {
        const { data } = await api.post(`/users/${userId}/follow`);
        return data;
    },
};

export default api;
