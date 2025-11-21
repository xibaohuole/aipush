import { NewsItem, DailySummary, NewsCategory, Region } from '../types';

// Mock data for development
const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'OpenAI Releases GPT-5 Preview with Significant Performance Improvements',
    summary: 'OpenAI announced the preview release of GPT-5, showcasing major advancements in reasoning, coding, and multimodal understanding.',
    category: NewsCategory.AI,
    region: Region.NORTH_AMERICA,
    impact: 95,
    timestamp: new Date().toISOString(),
    source: 'OpenAI Blog',
    url: 'https://openai.com',
  },
  {
    id: '2',
    title: 'Google Unveils Next-Gen TPU v6 AI Chips',
    summary: 'Google Cloud announces TPU v6, offering 3x performance improvement over previous generation for AI workloads.',
    category: NewsCategory.HARDWARE,
    region: Region.NORTH_AMERICA,
    impact: 88,
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    source: 'Google Cloud Blog',
    url: 'https://cloud.google.com',
  },
  {
    id: '3',
    title: 'Meta Open Sources Llama 3.5 Model',
    summary: 'Meta releases Llama 3.5, an open-source large language model with improved multilingual capabilities.',
    category: NewsCategory.AI,
    region: Region.GLOBAL,
    impact: 92,
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    source: 'Meta AI',
    url: 'https://ai.meta.com',
  },
];

export async function fetchRealtimeNews(): Promise<NewsItem[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return mockNews;
}

export async function generateDailyBriefing(
  newsItems: NewsItem[],
  language: string
): Promise<DailySummary> {
  // Simulate AI generation
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    date: new Date().toLocaleDateString(),
    content:
      language === 'Chinese'
        ? '今日 AI 领域出现多个重要进展。OpenAI 发布了 GPT-5 预览版，展示了显著的性能提升。Google 推出了新一代 TPU v6 芯片，为 AI 工作负载提供了 3 倍的性能提升。Meta 开源了 Llama 3.5 模型，改进了多语言能力。'
        : 'Several significant developments in the AI field today. OpenAI released the GPT-5 preview, showcasing significant performance improvements. Google unveiled the next-gen TPU v6 chips, offering 3x performance boost for AI workloads. Meta open-sourced the Llama 3.5 model with improved multilingual capabilities.',
    highlights: [
      'GPT-5 Preview Released',
      'Google TPU v6 Announced',
      'Meta Llama 3.5 Open Sourced',
    ],
    keyTrends: ['Large Language Models', 'AI Hardware', 'Open Source AI'],
  };
}

export async function askAI(question: string, newsItem: NewsItem): Promise<string> {
  // Simulate AI response
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const responses = [
    `Regarding "${newsItem.title}": ${question} - This development could have significant implications for the AI industry...`,
    `Based on the article about "${newsItem.title}", here's what I think about your question "${question}": The key impact areas include...`,
    `Great question! Considering the context of "${newsItem.title}" and your question "${question}", the answer involves...`,
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}
