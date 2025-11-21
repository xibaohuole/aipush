import { useState } from 'react';
import { Search, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { cn, formatDateTime } from '../../lib/utils';

const mockComments = [
  {
    id: '1',
    content: '这篇文章写得很好，信息量很大！',
    author: '张三',
    newsTitle: 'OpenAI 发布 GPT-5 预览版',
    status: 'approved',
    createdAt: '2025-01-15T12:00:00Z',
    likes: 15,
  },
  {
    id: '2',
    content: '垃圾内容，包含不当言论',
    author: '恶意用户',
    newsTitle: 'Google 推出新一代 AI 芯片',
    status: 'pending',
    createdAt: '2025-01-15T11:30:00Z',
    likes: 0,
  },
  {
    id: '3',
    content: '感谢分享，期待更多这样的内容',
    author: '李四',
    newsTitle: 'Meta 开源 Llama 3.5 模型',
    status: 'approved',
    createdAt: '2025-01-14T18:00:00Z',
    likes: 8,
  },
  {
    id: '4',
    content: '广告垃圾信息',
    author: '垃圾账号',
    newsTitle: 'OpenAI 发布 GPT-5 预览版',
    status: 'rejected',
    createdAt: '2025-01-14T16:00:00Z',
    likes: 0,
  },
];

export default function CommentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredComments = mockComments.filter((comment) => {
    const matchesSearch =
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || comment.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          评论审核
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          审核和管理用户评论内容
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索评论内容或用户..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">所有状态</option>
            <option value="approved">已批准</option>
            <option value="pending">待审核</option>
            <option value="rejected">已拒绝</option>
          </select>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.map((comment) => (
          <div
            key={comment.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {comment.author}
                  </span>
                  <span
                    className={cn(
                      'px-2 py-1 text-xs font-medium rounded',
                      comment.status === 'approved'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : comment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    )}
                  >
                    {comment.status === 'approved'
                      ? '已批准'
                      : comment.status === 'pending'
                      ? '待审核'
                      : '已拒绝'}
                  </span>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  {comment.content}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>文章: {comment.newsTitle}</span>
                  <span>{formatDateTime(comment.createdAt)}</span>
                  <span>{comment.likes} 点赞</span>
                </div>
              </div>

              <div className="flex gap-2">
                {comment.status === 'pending' && (
                  <>
                    <button className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg">
                      <XCircle className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredComments.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">没有找到匹配的评论</p>
        </div>
      )}
    </div>
  );
}
