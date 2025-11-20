
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

export const UI_TRANSLATIONS: Record<string, any> = {
  'English': {
    header: {
      title: 'AI Pulse',
      subtitle: 'Curated. Critical. Concise.',
      subtitleBookmark: 'Saved Library',
      searchPlaceholder: 'Ask Pulse or Search...',
      lastUpdated: 'Last Synced',
      nextUpdate: 'Next Edition',
      generateReport: 'Weekly PDF',
      addCustom: 'Submit Link'
    },
    nav: {
      dashboard: 'Daily Feed',
      trending: 'Leaderboard',
      dailyBrief: 'Audio Brief',
      settings: 'Settings'
    },
    filters: {
      bookmarks: 'Saved',
      categories: 'Topics',
      regions: 'Regions',
      syncing: 'Updating...',
      refresh: 'Sync'
    },
    actions: {
      saveNotion: 'Save to Notion',
      saveReadwise: 'Readwise',
      ask: 'Ask Pulse',
      listen: 'Listen (11m)',
      why: 'Why it matters'
    },
    growth: {
      invite: 'Invite Friends',
      inviteDesc: 'Get Lifetime Pro Access',
      sponsors: 'Top Supporters',
      pdf: 'Download PDF'
    },
    empty: {
      noNews: 'All caught up. Next edition coming soon.',
      noMatch: 'No items match.'
    }
  },
  'Chinese': {
    header: {
      title: 'AI 脉搏',
      subtitle: '每天5分钟，掌握全球核心动态',
      subtitleBookmark: '我的知识库',
      searchPlaceholder: '搜索或向 AI 提问...',
      lastUpdated: '上次同步',
      nextUpdate: '下期预告',
      generateReport: '周报 PDF',
      addCustom: '投稿链接'
    },
    nav: {
      dashboard: '今日动态',
      trending: '热度排行',
      dailyBrief: '音频简报',
      settings: '设置'
    },
    filters: {
      bookmarks: '已藏',
      categories: '话题',
      regions: '地区',
      syncing: '同步中...',
      refresh: '刷新'
    },
    actions: {
      saveNotion: '存入 Notion',
      saveReadwise: 'Readwise',
      ask: '追问 AI',
      listen: '收听 (11分)',
      why: '一句话影响'
    },
    growth: {
      invite: '邀请好友',
      inviteDesc: '获终身会员权益',
      sponsors: '赞助榜单',
      pdf: '下载合集'
    },
    empty: {
      noNews: '今日内容已读完，敬请期待下期。',
      noMatch: '无匹配内容。'
    }
  }
};
