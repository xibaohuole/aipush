import React from 'react';
import { Globe, Type } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@aipush/ui';

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
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Customize your preferences</p>
      </div>

      <div className="space-y-6">
        <Card variant="bordered" className="bg-white/5 border-white/10">
          <CardHeader className="border-white/10">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Language
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['English', 'Chinese'].map((lang) => (
                <label
                  key={lang}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition"
                >
                  <input
                    type="radio"
                    name="language"
                    value={lang}
                    checked={currentLanguage === lang}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-white">{lang}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card variant="bordered" className="bg-white/5 border-white/10">
          <CardHeader className="border-white/10">
            <h2 className="font-bold text-white text-lg flex items-center gap-2">
              <Type className="w-5 h-5" />
              Font
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['sans', 'serif', 'mono'].map((font) => (
                <label
                  key={font}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition"
                >
                  <input
                    type="radio"
                    name="font"
                    value={font}
                    checked={currentFont === font}
                    onChange={(e) => onFontChange(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-white capitalize">{font}</span>
                </label>
              ))}
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
