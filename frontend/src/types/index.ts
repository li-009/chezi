/**
 * 类型定义
 */

// 用户
export interface User {
    id: number;
    username: string;
    avatar: string;
    level: number;
    points: number;
    coins: number;
    operation_time?: number;
    token?: string;
}

// 设备
export interface Vehicle {
    id: number;
    vehicle_id: string;
    name: string;
    type: string;
    status: 'available' | 'reserved' | 'in_use' | 'offline';
    price: number;
    latency: number;
    image: string;
    rating: number;
}

// 帖子
export interface Post {
    id: number;
    user_id: number;
    author: {
        id: number;
        username: string;
        avatar: string;
    };
    content: string;
    image?: string;
    likesCount: number;
    commentsCount: number;
    is_liked: boolean;
    created_at: string;
}

// 评论
export interface Comment {
    id: number;
    post_id: number;
    user_id: number;
    author: string;
    avatar: string;
    content: string;
    created_at: string;
}

// 商品
export interface StoreItem {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    stock: number;
}

// 订单
export interface Order {
    id: number;
    total_amount: number;
    status: string;
    created_at: string;
    items: OrderItem[];
}

export interface OrderItem {
    id: number;
    item_id: number;
    quantity: number;
    price: number;
}

// API 响应
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
}

// 用户统计
export interface UserStats {
    operationTime: number;
    earnings: number;
    tasksCompleted: number;
}
