import { Save, RotateCcw } from 'lucide-react';
import { useTranslation } from '@aipush/i18n';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@aipush/ui';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';

// 定义设置表单的验证 schema
const settingsSchema = z.object({
  // 基础设置
  siteName: z.string().min(1, 'Site name is required').max(100, 'Site name is too long'),
  siteDescription: z.string().min(1, 'Site description is required').max(500, 'Description is too long'),
  itemsPerPage: z.coerce.number().min(5, 'Minimum 5 items per page').max(100, 'Maximum 100 items per page'),
  commentsEnabled: z.boolean(),
  autoApproveComments: z.boolean(),

  // API 设置
  glmApiKey: z.string().optional(),
  apiBaseUrl: z.string().url('Must be a valid URL').min(1, 'API base URL is required'),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

// 默认设置值
const defaultSettings: SettingsFormData = {
  siteName: 'AI Pulse Daily',
  siteDescription: 'Your daily AI news aggregation platform',
  itemsPerPage: 20,
  commentsEnabled: true,
  autoApproveComments: false,
  glmApiKey: '',
  apiBaseUrl: 'http://localhost:4000',
};

export default function SettingsPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // 获取设置
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const response = await api.getSettings();
      return response.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultSettings,
    values: settings ? {
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      itemsPerPage: settings.itemsPerPage,
      commentsEnabled: settings.commentsEnabled,
      autoApproveComments: settings.autoApproveComments,
      glmApiKey: settings.glmApiKey || '',
      apiBaseUrl: settings.apiBaseUrl,
    } : undefined,
  });

  // 更新设置的 mutation
  const updateMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      const response = await api.updateSettings(data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
      toast.success('Settings saved successfully!');
      reset(data as SettingsFormData);
    },
    onError: (error: any) => {
      console.error('Failed to save settings:', error);
      toast.error(error.message || 'Failed to save settings. Please try again.');
    },
  });

  // 重置设置的 mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      const response = await api.resetSettings();
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
      toast.success('Settings reset to default values!');
      reset(data as SettingsFormData);
    },
    onError: (error: any) => {
      console.error('Failed to reset settings:', error);
      toast.error(error.message || 'Failed to reset settings. Please try again.');
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    updateMutation.mutate(data);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      resetMutation.mutate();
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('admin.settings.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('admin.settings.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 基础设置 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('admin.settings.basic.title')}
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* 网站名称 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.settings.basic.siteName')}
              </label>
              <input
                type="text"
                {...register('siteName')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              {errors.siteName && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.siteName.message}
                </p>
              )}
            </div>

            {/* 网站描述 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.settings.basic.siteDescription')}
              </label>
              <textarea
                rows={3}
                {...register('siteDescription')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              {errors.siteDescription && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.siteDescription.message}
                </p>
              )}
            </div>

            {/* 每页条目数 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.settings.basic.itemsPerPage')}
              </label>
              <input
                type="number"
                {...register('itemsPerPage')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              {errors.itemsPerPage && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.itemsPerPage.message}
                </p>
              )}
            </div>

            {/* 启用评论 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="comments-enabled"
                {...register('commentsEnabled')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="comments-enabled"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                {t('admin.settings.basic.enableComments')}
              </label>
            </div>

            {/* 自动批准评论 */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto-approve"
                {...register('autoApproveComments')}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="auto-approve"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                {t('admin.settings.basic.autoApproveComments')}
              </label>
            </div>
          </div>
        </div>

        {/* API 设置 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('admin.settings.api.title')}
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* GLM API Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.settings.api.glmKey')}
              </label>
              <input
                type="password"
                {...register('glmApiKey')}
                placeholder="••••••••••••••••"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              {errors.glmApiKey && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.glmApiKey.message}
                </p>
              )}
            </div>

            {/* API Base URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.settings.api.baseUrl')}
              </label>
              <input
                type="url"
                {...register('apiBaseUrl')}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              {errors.apiBaseUrl && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.apiBaseUrl.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={!isDirty || updateMutation.isPending}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? 'Saving...' : t('admin.settings.buttons.save')}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={updateMutation.isPending || resetMutation.isPending}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {resetMutation.isPending ? 'Resetting...' : 'Reset'}
          </button>

          {isDirty && (
            <span className="text-sm text-amber-600 dark:text-amber-400">
              You have unsaved changes
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
