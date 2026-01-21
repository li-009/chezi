/**
 * 登录页面
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../services/api';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { setUser } = useAuthStore();

    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            setError('请输入用户名和密码');
            return;
        }

        if (username.length < 3) {
            setError('用户名至少3个字符');
            return;
        }

        if (password.length < 6) {
            setError('密码至少6个字符');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = isRegister
                ? await authApi.register(username, password)
                : await authApi.login(username, password);

            if (result.success && result.data) {
                setUser(result.data, result.data.token);
                navigate('/');
            } else {
                setError(result.message || (isRegister ? '注册失败' : '登录失败'));
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || '网络错误，请检查后端服务');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 flex flex-col items-center justify-center px-6">
            {/* Logo */}
            <div className="mb-8 text-center">
                <div className="w-20 h-20 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-4xl">🏗️</span>
                </div>
                <h1 className="text-3xl font-bold text-white">
                    {isRegister ? '注册账号' : 'Chezi 远程操控'}
                </h1>
                <p className="text-gray-400 mt-2">
                    {isRegister ? '创建您的操作员账号' : '工业设备远程操控平台'}
                </p>
            </div>

            {/* 表单 */}
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
                <div>
                    <label className="block text-gray-300 text-sm mb-2">用户名</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                        placeholder="请输入用户名"
                    />
                </div>

                <div>
                    <label className="block text-gray-300 text-sm mb-2">密码</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500"
                        placeholder="请输入密码"
                    />
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                    {loading ? '处理中...' : isRegister ? '立即注册' : '登录'}
                </button>

                <div className="text-center text-gray-400 text-sm">
                    {isRegister ? '已有账号？' : '没有账号？'}
                    <button
                        type="button"
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setError('');
                        }}
                        className="text-yellow-500 hover:underline ml-1"
                    >
                        {isRegister ? '立即登录' : '注册账号'}
                    </button>
                </div>

                {/* 测试账号提示 */}
                <div className="bg-gray-700/50 rounded-lg p-3 text-center text-gray-400 text-xs">
                    测试: 先注册一个账号，或使用已有账号登录
                </div>
            </form>
        </div>
    );
};

export default LoginPage;
