
// In a real app, this would be fetched from RSS feeds or News APIs.

export const RAW_NEWS_FEED = [
  "Google announces Gemini 2.5, claiming 40% faster inference speeds and improved reasoning capabilities for coding tasks.",
  "OpenAI receives a new round of funding led by Thrive Capital, valuing the company at over 80 billion dollars.",
  "New EU AI Act comes into effect today, imposing strict regulations on high-risk AI applications and requiring transparency for foundational models.",
  "Researchers at MIT develop a new method 'Liquid Neural Networks' that adapts continuously to new data, showing promise for autonomous driving.",
  "Anthropic releases Claude 3.5 Sonnet, featuring improved vision capabilities and a larger context window for enterprise users.",
  "NVIDIA stock surges past expectations as demand for H100 chips remains at an all-time high due to generative AI boom.",
  "DeepMind's AlphaFold 3 predicts structure of nearly all life's molecules, a major breakthrough for drug discovery.",
  "Meta introduces Llama 3 with open weights, challenging proprietary models and sparking debate on open-source AI safety.",
  "US Government issues executive order on safe, secure, and trustworthy development of artificial intelligence.",
  "A critical vulnerability found in popular vector database could allow prompt injection attacks, security experts warn.",
  "Twitter user creates a viral AI agent that strictly replies with cat memes, causing havoc in crypto trading bots."
];

export const MOCK_SOURCES = [
  "TechCrunch", "The Verge", "Arxiv", "Bloomberg", "Reuters", "Hacker News"
];

export const MOCK_COMMENTS = [
  { id: 'c1', user: 'Alice', avatar: 'A', content: 'This changes everything for startups.', likes: 42, isPinned: true },
  { id: 'c2', user: 'Bob', avatar: 'B', content: 'Finally, some regulation!', likes: 12 },
  { id: 'c3', user: 'Charlie', avatar: 'C', content: 'I give it 6 months before next version.', likes: 5 },
  { id: 'c4', user: 'Dave', avatar: 'D', content: 'Is this really "open" source though?', likes: 28 }
];

// UI_TRANSLATIONS has been migrated to @aipush/i18n package
// All translations are now managed in packages/i18n/src/locales/
// - en-US.json for English translations
// - zh-CN.json for Chinese translations
// Use `import { useTranslation } from '@aipush/i18n'` in your components
