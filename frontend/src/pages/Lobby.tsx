/**
 * 大厅页面 - 设备列表
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { vehicleApi } from '../services/api';
import { Vehicle } from '../types';

const vehicleTypes = [
    { value: 'all', label: '全部' },
    { value: 'excavator', label: '挖掘机' },
    { value: 'crane', label: '起重机' },
    { value: 'loader', label: '装载机' },
];

const LobbyPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState('all');

    const { data, isLoading } = useQuery({
        queryKey: ['vehicles', selectedType],
        queryFn: () => vehicleApi.getAll(selectedType),
    });

    const vehicles = data?.data || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-500';
            case 'reserved':
                return 'bg-yellow-500';
            case 'in_use':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'available':
                return '可用';
            case 'reserved':
                return '已预约';
            case 'in_use':
                return '使用中';
            default:
                return '维护中';
        }
    };

    return (
        <div className="p-4">
            {/* 标题 */}
            <h1 className="text-2xl font-bold mb-4">设备大厅</h1>

            {/* 类型筛选 */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {vehicleTypes.map((type) => (
                    <button
                        key={type.value}
                        onClick={() => setSelectedType(type.value)}
                        className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${selectedType === type.value
                                ? 'bg-yellow-500 text-gray-900'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                    >
                        {type.label}
                    </button>
                ))}
            </div>

            {/* 设备列表 */}
            {isLoading ? (
                <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {vehicles.map((vehicle: Vehicle) => (
                        <div
                            key={vehicle.id}
                            className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700"
                        >
                            {/* 设备图片 */}
                            <div className="h-40 bg-gray-700">
                                {vehicle.image && (
                                    <img
                                        src={vehicle.image}
                                        alt={vehicle.name}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                            </div>

                            {/* 设备信息 */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-lg font-semibold">{vehicle.name}</h3>
                                    <span
                                        className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(
                                            vehicle.status
                                        )}`}
                                    >
                                        {getStatusText(vehicle.status)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                                    <span>延迟: {vehicle.latency}ms</span>
                                    <span>评分: ⭐ {vehicle.rating}</span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-yellow-500 font-bold">
                                        ¥{vehicle.price}/分钟
                                    </span>
                                    <button
                                        onClick={() => navigate(`/control/${vehicle.id}`)}
                                        disabled={vehicle.status !== 'available'}
                                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        开始操控
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {vehicles.length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                            暂无可用设备
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default LobbyPage;
