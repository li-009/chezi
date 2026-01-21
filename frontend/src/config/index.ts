/**
 * 应用配置
 */

// API 基础 URL - 从环境变量读取
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// WebSocket URL
export const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

// Token 存储键名
export const TOKEN_KEY = 'chezi_token';

// 默认头像
export const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
