/**
 * 控制室页面
 */
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const ControlRoomPage: React.FC = () => {
    const navigate = useNavigate();
    const { vehicleId } = useParams();

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* 顶部栏 */}
            <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
                <button
                    onClick={() => navigate('/')}
                    className="text-white hover:text-yellow-500"
                >
                    ← 返回
                </button>
                <h1 className="text-lg font-semibold">控制室</h1>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-sm text-gray-400">已连接</span>
                </div>
            </div>

            {/* 视频区域 */}
            <div className="flex-1 bg-gray-800 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                        <div className="text-6xl mb-4">📹</div>
                        <p>设备 #{vehicleId} 视频流</p>
                        <p className="text-sm mt-2">(实际项目需要接入 WebRTC)</p>
                    </div>
                </div>

                {/* 遥测数据覆盖层 */}
                <div className="absolute top-4 left-4 bg-black/50 rounded-lg p-3 text-sm">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <span className="text-gray-400">延迟:</span>
                        <span className="text-green-400">45ms</span>
                        <span className="text-gray-400">帧率:</span>
                        <span className="text-white">30fps</span>
                        <span className="text-gray-400">速度:</span>
                        <span className="text-white">0.0 m/s</span>
                    </div>
                </div>

                {/* 设备状态 */}
                <div className="absolute top-4 right-4 bg-black/50 rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400">电量:</span>
                        <div className="w-20 h-2 bg-gray-600 rounded-full overflow-hidden">
                            <div className="w-4/5 h-full bg-green-500"></div>
                        </div>
                        <span className="text-white">80%</span>
                    </div>
                </div>
            </div>

            {/* 控制面板 */}
            <div className="bg-gray-800 p-4 border-t border-gray-700">
                <div className="max-w-sm mx-auto">
                    {/* 方向控制 */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div></div>
                        <button className="h-14 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-2xl">
                            ↑
                        </button>
                        <div></div>
                        <button className="h-14 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-2xl">
                            ←
                        </button>
                        <button className="h-14 bg-red-500 hover:bg-red-600 rounded-lg flex items-center justify-center text-sm font-bold">
                            停止
                        </button>
                        <button className="h-14 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-2xl">
                            →
                        </button>
                        <div></div>
                        <button className="h-14 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center text-2xl">
                            ↓
                        </button>
                        <div></div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="grid grid-cols-2 gap-2">
                        <button className="py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-semibold">
                            🔧 铲斗升
                        </button>
                        <button className="py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-semibold">
                            🔧 铲斗降
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ControlRoomPage;
