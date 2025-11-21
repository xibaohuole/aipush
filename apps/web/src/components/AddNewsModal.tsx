import React, { useState } from 'react';
import { Modal, Input, Button } from '@aipush/ui';
import { useTranslation } from '@aipush/i18n';
import { NewsItem, NewsCategory, Region } from '../types';

interface AddNewsModalProps {
  onClose: () => void;
  onAdd: (item: NewsItem) => void;
}

const AddNewsModal: React.FC<AddNewsModalProps> = ({ onClose, onAdd }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState<NewsCategory>(NewsCategory.AI);
  const [region, setRegion] = useState<Region>(Region.GLOBAL);
  const [source, setSource] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newItem: NewsItem = {
      id: `custom-${Date.now()}`,
      title,
      summary,
      category,
      region,
      impact: 50,
      timestamp: new Date().toISOString(),
      source,
      isCustom: true,
    };

    onAdd(newItem);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={t('addNewsModal.title')} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t('addNewsModal.fields.headline')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('addNewsModal.placeholders.headline')}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('addNewsModal.fields.notes')}
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder={t('addNewsModal.placeholders.notes')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('addNewsModal.fields.category')}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as NewsCategory)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.values(NewsCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('addNewsModal.fields.region')}
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as Region)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.values(Region).map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label={t('addNewsModal.fields.url')}
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder={t('addNewsModal.placeholders.url')}
          required
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" onClick={onClose} variant="outline">
            {t('addNewsModal.buttons.cancel')}
          </Button>
          <Button type="submit" variant="primary">
            {t('addNewsModal.buttons.add')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddNewsModal;
