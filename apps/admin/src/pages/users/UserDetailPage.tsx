import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Calendar, Activity, Ban, Trash2 } from 'lucide-react';
import { formatDateTime } from '../../lib/utils';

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock user data
  const user = {
    id,
    name: '张三',
    email: 'zhangsan@example.com',
    role: 'user',
    status: 'active',
    joinedAt: '2025-01-10T08:30:00Z',
    lastActive: '2025-01-15T14:22:00Z',
    bio: '热爱科技的AI爱好者',
    stats: {
      posts: 24,
      comments: 156,
      bookmarks: 89,
    },
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/users')}
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-5 h-5" />
        返回用户列表
      </button>

      {/* User Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end gap-6 -mt-16">
            <div className="w-32 h-32 bg-blue-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center text-white text-4xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 pt-20">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">{user.bio}</p>
            </div>
            <div className="flex gap-2 pt-20">
              <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg flex items-center gap-2">
                <Ban className="w-4 h-4" />
                停用账号
              </button>
              <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                删除账号
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              基本信息
            </h2>
            <dl className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <dt className="text-gray-600 dark:text-gray-400 w-24">邮箱:</dt>
                <dd className="text-gray-900 dark:text-white">{user.email}</dd>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <dt className="text-gray-600 dark:text-gray-400 w-24">注册时间:</dt>
                <dd className="text-gray-900 dark:text-white">
                  {formatDateTime(user.joinedAt)}
                </dd>
              </div>
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-gray-400" />
                <dt className="text-gray-600 dark:text-gray-400 w-24">最后活跃:</dt>
                <dd className="text-gray-900 dark:text-white">
                  {formatDateTime(user.lastActive)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
              活动统计
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    发布内容
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user.stats.posts}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    评论数
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user.stats.comments}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    收藏数
                  </span>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {user.stats.bookmarks}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
