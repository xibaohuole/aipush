import React from 'react';
import { Globe, Type, Zap } from 'lucide-react';
import { Card, CardHeader, CardContent, Button } from '@aipush/ui';
import { useTranslation } from '@aipush/i18n';

interface SettingsProps {
  currentLanguage: string;
  currentFont: string;
  onLanguageChange: (language: string) => void;
  onFontChange: (font: string) => void;
}

const Settings: React.FC<SettingsProps> = ({
  currentLanguage,
  currentFont,
  onLanguageChange,
  onFontChange,
}) => {
  const { t } = useTranslation();
  const languageOptions = [
    { value: 'English', label: t('settings.language.options.english') },
    { value: 'Chinese', label: t('settings.language.options.chinese') },
  ];

  const fontOptions = [
    { value: 'sans', label: t('settings.font.options.sans') },
    { value: 'serif', label: t('settings.font.options.serif') },
    { value: 'mono', label: t('settings.font.options.mono') },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">{t('settings.title')}</h1>
        <p className="text-gray-400">{t('settings.sections.appearance')}</p>
      </div>

      <div className="space-y-6">
        <Card variant="bordered" className="bg-white/5 border-white/10">
          <CardHeader className="border-white/10">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Globe className="w-5 h-5" />
              {t('settings.language.label')}
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-3">{t('settings.language.description')}</p>
            <div className="space-y-2">
              {languageOptions.map(({ value, label }) => (
                <label
                  key={value}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition"
                >
                  <input
                    type="radio"
                    name="language"
                    value={value}
                    checked={currentLanguage === value}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-white">{label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered" className="bg-white/5 border-white/10">
          <CardHeader className="border-white/10">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Type className="w-5 h-5" />
              {t('settings.font.label')}
            </h2>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-400 mb-3">{t('settings.font.description')}</p>
            <div className="space-y-2">
              {fontOptions.map(({ value, label }) => (
                <label
                  key={value}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition"
                >
                  <input
                    type="radio"
                    name="font"
                    value={value}
                    checked={currentFont === value}
                    onChange={(e) => onFontChange(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-white">{label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered" className="bg-white/5 border-white/10">
          <CardHeader className="border-white/10">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Zap className="w-5 h-5" />
              API Test
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300">Test GLM API connection</p>
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer 1c1aa0b4b71f43518dd7d03ba933bd3c.nD3WVYmgqa8thszj`,
                      },
                      body: JSON.stringify({
                        model: 'glm-4-flash',
                        messages: [{ role: 'user', content: 'Hello!' }],
                        max_tokens: 20
                      }),
                    });

                    if (response.ok) {
                      const data = await response.json();
                      alert('API Success: ' + data.choices[0].message.content);
                    } else {
                      const error = await response.text();
                      alert('API Error: ' + error);
                    }
                  } catch (error: unknown) {
                    if (error instanceof Error) {
                      alert('Network Error: ' + error.message);
                    }
                  }
                }}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                Test GLM API
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered" className="bg-white/5 border-white/10">
          <CardHeader className="border-white/10">
            <h2 className="font-bold text-white text-lg">About</h2>
          </CardHeader>
          <CardContent>
            <div className="text-gray-300 space-y-2">
              <p><strong>Version:</strong> 1.0.0</p>
              <p><strong>Build:</strong> Production</p>
              <p className="text-sm text-gray-400 pt-4">
                AI Pulse Daily - Your daily AI news aggregator powered by advanced AI technology.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
