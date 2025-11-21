import { Save } from 'lucide-react';
import { useTranslation } from '@aipush/i18n';

export default function SettingsPage() {
  const { t } = useTranslation();
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

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('admin.settings.basic.title')}
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.settings.basic.siteName')}
            </label>
            <input
              type="text"
              defaultValue="AI Pulse Daily"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.settings.basic.siteDescription')}
            </label>
            <textarea
              rows={3}
              defaultValue="Your daily AI news aggregation platform"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.settings.basic.itemsPerPage')}
            </label>
            <input
              type="number"
              defaultValue="20"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="comments-enabled"
              defaultChecked
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="comments-enabled"
              className="ml-2 text-sm text-gray-700 dark:text-gray-300"
            >
              {t('admin.settings.basic.enableComments')}
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="auto-approve"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="auto-approve"
              className="ml-2 text-sm text-gray-700 dark:text-gray-300"
            >
              {t('admin.settings.basic.autoApproveComments')}
            </label>
          </div>

          <div className="pt-4">
            <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
              <Save className="w-4 h-4" />
              {t('admin.settings.buttons.save')}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('admin.settings.api.title')}
          </h2>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.settings.api.glmKey')}
            </label>
            <input
              type="password"
              placeholder="••••••••••••••••"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('admin.settings.api.baseUrl')}
            </label>
            <input
              type="url"
              defaultValue="http://localhost:4000"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="pt-4">
            <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
              <Save className="w-4 h-4" />
              {t('admin.settings.buttons.saveApi')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
