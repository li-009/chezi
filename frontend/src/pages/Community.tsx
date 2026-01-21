/**
 * 社区页面
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postApi } from '../services/api';
import { useAuthStore } from '../stores/authStore';
import { Post } from '../types';

const CommunityPage: React.FC = () => {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const [newPost, setNewPost] = useState('');
    const [showComments, setShowComments] = useState<number | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['posts'],
        queryFn: postApi.getAll,
    });

    const posts = data?.data || [];

    const createMutation = useMutation({
        mutationFn: (content: string) => postApi.create(content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            setNewPost('');
        },
    });

    const likeMutation = useMutation({
        mutationFn: (postId: number) => postApi.toggleLike(postId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
    });

    const handleSubmit = () => {
        if (!newPost.trim()) return;
        createMutation.mutate(newPost);
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}分钟前`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}小时前`;
        return `${Math.floor(hours / 24)}天前`;
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">社区</h1>

            {/* 发帖框 */}
            <div className="bg-gray-800 rounded-xl p-4 mb-4 border border-gray-700">
                <div className="flex items-start gap-3">
                    <img
                        src={user?.avatar || ''}
                        alt="avatar"
                        className="w-10 h-10 rounded-full bg-gray-600"
                    />
                    <div className="flex-1">
                        <textarea
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            placeholder="分享你的操控心得..."
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-yellow-500"
                            rows={3}
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={handleSubmit}
                                disabled={!newPost.trim() || createMutation.isPending}
                                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-semibold disabled:opacity-50"
                            >
                                {createMutation.isPending ? '发布中...' : '发布'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 帖子列表 */}
            {isLoading ? (
                <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post: Post) => (
                        <div
                            key={post.id}
                            className="bg-gray-800 rounded-xl p-4 border border-gray-700"
                        >
                            {/* 作者信息 */}
                            <div className="flex items-center gap-3 mb-3">
                                <img
                                    src={post.author?.avatar || ''}
                                    alt="avatar"
                                    className="w-10 h-10 rounded-full bg-gray-600"
                                />
                                <div>
                                    <div className="font-semibold">{post.author?.username}</div>
                                    <div className="text-xs text-gray-400">
                                        {formatTime(post.created_at)}
                                    </div>
                                </div>
                            </div>

                            {/* 内容 */}
                            <p className="text-gray-200 mb-3">{post.content}</p>

                            {/* 图片 */}
                            {post.image && (
                                <img
                                    src={post.image}
                                    alt="post"
                                    className="w-full rounded-lg mb-3"
                                />
                            )}

                            {/* 互动按钮 */}
                            <div className="flex items-center gap-6 text-gray-400">
                                <button
                                    onClick={() => likeMutation.mutate(post.id)}
                                    className={`flex items-center gap-1 hover:text-yellow-500 ${post.is_liked ? 'text-yellow-500' : ''
                                        }`}
                                >
                                    <span>{post.is_liked ? '❤️' : '🤍'}</span>
                                    <span>{post.likesCount}</span>
                                </button>
                                <button
                                    onClick={() =>
                                        setShowComments(showComments === post.id ? null : post.id)
                                    }
                                    className="flex items-center gap-1 hover:text-yellow-500"
                                >
                                    <span>💬</span>
                                    <span>{post.commentsCount}</span>
                                </button>
                            </div>
                        </div>
                    ))}

                    {posts.length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                            还没有帖子，来发第一条吧！
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommunityPage;
