/**
 * 底部导航栏组件
 */
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const tabs = [
    { path: '/', icon: '🏠', label: '大厅' },
    { path: '/community', icon: '👥', label: '社区' },
    { path: '/store', icon: '🛒', label: '商城' },
    { path: '/profile', icon: '👤', label: '我的' },
];

const BottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-4 py-2 z-50">
            <div className="flex justify-around items-center max-w-lg mx-auto">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    return (
                        <button
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${isActive
                                    ? 'text-yellow-500'
                                    : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            <span className="text-xs mt-1">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
