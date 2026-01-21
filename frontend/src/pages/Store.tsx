/**
 * 商城页面
 */
import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { storeApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { StoreItem } from '../types';

const StorePage: React.FC = () => {
    const { user, updateUser } = useAuthStore();
    const [cart, setCart] = useState<Map<number, number>>(new Map());

    const { data, isLoading } = useQuery({
        queryKey: ['storeItems'],
        queryFn: () => storeApi.getItems(),
    });

    const items = data?.data || [];

    const orderMutation = useMutation({
        mutationFn: (items: { item_id: number; quantity: number }[]) =>
            storeApi.createOrder(items),
        onSuccess: (result) => {
            if (result.success && result.data) {
                updateUser({ coins: result.data.remaining_balance });
                setCart(new Map());
                alert('下单成功！');
            }
        },
        onError: (err: any) => {
            alert(err.response?.data?.detail || '下单失败');
        },
    });

    const addToCart = (itemId: number) => {
        setCart((prev) => {
            const newCart = new Map(prev);
            newCart.set(itemId, (newCart.get(itemId) || 0) + 1);
            return newCart;
        });
    };

    const removeFromCart = (itemId: number) => {
        setCart((prev) => {
            const newCart = new Map(prev);
            const count = newCart.get(itemId) || 0;
            if (count <= 1) {
                newCart.delete(itemId);
            } else {
                newCart.set(itemId, count - 1);
            }
            return newCart;
        });
    };

    const cartTotal = Array.from(cart.entries()).reduce((total, [itemId, qty]) => {
        const item = items.find((i: StoreItem) => i.id === itemId);
        return total + (item?.price || 0) * qty;
    }, 0);

    const handleCheckout = () => {
        const orderItems = Array.from(cart.entries()).map(([item_id, quantity]) => ({
            item_id,
            quantity,
        }));
        orderMutation.mutate(orderItems);
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">商城</h1>
                <div className="text-yellow-500 font-semibold">
                    余额: ¥{user?.coins?.toFixed(2) || '0.00'}
                </div>
            </div>

            {/* 商品列表 */}
            {isLoading ? (
                <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 mb-20">
                    {items.map((item: StoreItem) => {
                        const inCart = cart.get(item.id) || 0;
                        return (
                            <div
                                key={item.id}
                                className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700"
                            >
                                <div className="h-32 bg-gray-700">
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="p-3">
                                    <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-yellow-500 font-bold">
                                            ¥{item.price}
                                        </span>
                                        {inCart > 0 ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="w-6 h-6 bg-gray-600 rounded text-sm"
                                                >
                                                    -
                                                </button>
                                                <span className="text-sm">{inCart}</span>
                                                <button
                                                    onClick={() => addToCart(item.id)}
                                                    className="w-6 h-6 bg-yellow-500 text-gray-900 rounded text-sm"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => addToCart(item.id)}
                                                className="px-3 py-1 bg-yellow-500 text-gray-900 rounded text-sm font-semibold"
                                            >
                                                加入
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* 购物车悬浮条 */}
            {cart.size > 0 && (
                <div className="fixed bottom-20 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4">
                    <div className="flex justify-between items-center max-w-lg mx-auto">
                        <div>
                            <span className="text-gray-400">合计: </span>
                            <span className="text-yellow-500 font-bold text-lg">
                                ¥{cartTotal.toFixed(2)}
                            </span>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={orderMutation.isPending}
                            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-bold disabled:opacity-50"
                        >
                            {orderMutation.isPending ? '处理中...' : '结算'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StorePage;
