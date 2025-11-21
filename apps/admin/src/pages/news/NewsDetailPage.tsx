import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { formatDateTime, formatNumber } from '../../lib/utils';

export default function NewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock news data
  const news = {
    id,
    title: 'OpenAI 发布 GPT-5 预览版，性能大幅提升',
    content: `OpenAI 今天正式发布了 GPT-5 的预览版本，这是其最新一代的大语言模型。根据官方发布的信息，GPT-5 在多个基准测试中都表现出了显著的性能提升。

新模型在自然语言理解、代码生成、数学推理等多个方面都有重大突破。OpenAI 的 CEO Sam Altman 在发布会上表示，GPT-5 是该公司迄今为止最强大的模型。

主要改进包括：
- 更强的推理能力
- 更准确的事实性输出
- 更好的多模态理解
- 显著降低的幻觉率

该模型目前处于预览阶段，仅对部分企业客户开放测试。OpenAI 计划在未来几个月内逐步向更多用户开放访问权限。`,
    category: 'AI',
    status: 'published',
    views: 15234,
    comments: 89,
    author: '编辑部',
    createdAt: '2025-01-15T10:00:00Z',
    publishedAt: '2025-01-15T10:30:00Z',
    tags: ['OpenAI', 'GPT-5', '大语言模型', 'AI'],
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/news')}
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
      >
        <ArrowLeft className="w-5 h-5" />
        返回新闻列表
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {news.title}
            </h1>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                批准发布
              </button>
              <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                拒绝
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
            <span>作者: {news.author}</span>
            <span>分类: {news.category}</span>
            <span>创建时间: {formatDateTime(news.createdAt)}</span>
            {news.publishedAt && (
              <span>发布时间: {formatDateTime(news.publishedAt)}</span>
            )}
          </div>

          {news.status === 'published' && (
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
              <span className="inline-flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {formatNumber(news.views)} 浏览
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {news.comments} 评论
              </span>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            {news.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="prose dark:prose-invert max-w-none">
            {news.content.split('\n').map((paragraph, index) => (
              <p key={index} className="text-gray-700 dark:text-gray-300 mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
