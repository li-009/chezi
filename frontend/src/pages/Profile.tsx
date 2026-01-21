/**
 * 个人中心页面
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const { data: statsData } = useQuery({
        queryKey: ['userStats'],
        queryFn: userApi.getStats,
    });

    const stats = statsData?.data;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { icon: '📋', label: '我的订单', path: '/orders' },
        { icon: '💰', label: '充值中心', action: 'recharge' },
        { icon: '⚙️', label: '设置', path: '/settings' },
        { icon: '❓', label: '帮助中心', path: '/help' },
    ];

    return (
        <div className="p-4">
            {/* 用户信息卡片 */}
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-xl p-4 mb-4 text-gray-900">
                <div className="flex items-center gap-4">
                    <img
                        src={user?.avatar || ''}
                        alt="avatar"
                        className="w-16 h-16 rounded-full border-2 border-white"
                    />
                    <div>
                        <h2 className="text-xl font-bold">{user?.username}</h2>
                        <div className="flex items-center gap-2 text-sm opacity-90">
                            <span>Lv.{user?.level || 1}</span>
                            <span>•</span>
                            <span>{user?.points || 0} 积分</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-yellow-400/50">
                    <div className="text-center">
                        <div className="text-2xl font-bold">{stats?.operationTime || 0}</div>
                        <div className="text-xs opacity-80">操控时长(分)</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">
                            ¥{stats?.earnings?.toFixed(0) || 0}
                        </div>
                        <div className="text-xs opacity-80">累计收益</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">{stats?.tasksCompleted || 0}</div>
                        <div className="text-xs opacity-80">完成任务</div>
                    </div>
                </div>
            </div>

            {/* 余额卡片 */}
            <div className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-gray-400 text-sm">账户余额</div>
                        <div className="text-2xl font-bold text-yellow-500">
                            ¥{user?.coins?.toFixed(2) || '0.00'}
                        </div>
                    </div>
                    <button className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-semibold">
                        充值
                    </button>
                </div>
            </div>

            {/* 菜单列表 */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-4">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        className="w-full flex items-center gap-3 p-4 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-0"
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="flex-1 text-left">{item.label}</span>
                        <span className="text-gray-400">›</span>
                    </button>
                ))}
            </div>

            {/* 退出登录 */}
            <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-500/20 text-red-400 rounded-xl border border-red-500/50 font-semibold hover:bg-red-500/30 transition-colors"
            >
                退出登录
            </button>

            {/* 版本信息 */}
            <div className="text-center text-gray-500 text-xs mt-4">
                Chezi v2.0.0 • Refactored Edition
            </div>
        </div>
    );
};

export default ProfilePage;
