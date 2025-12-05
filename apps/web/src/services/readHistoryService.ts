import { getSessionId } from '../utils/session';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

/**
 * 标记新闻为已读
 */
export async function markAsRead(
  newsId: string,
  userId?: string,
  readDuration?: number,
  scrollDepth?: number,
): Promise<void> {
  const sessionId = getSessionId();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
  };

  if (userId) {
    headers['x-user-id'] = userId;
  }

  const response = await fetch(`${API_BASE_URL}/read-history/${newsId}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      readDuration,
      scrollDepth,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to mark as read: ${response.status}`);
  }

  return await response.json();
}

/**
 * 获取用户的已读历史
 */
export async function getUserReadHistory(
  page: number = 1,
  limit: number = 20,
  userId?: string,
): Promise<any> {
  const sessionId = getSessionId();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
  };

  if (userId) {
    headers['x-user-id'] = userId;
  }

  const response = await fetch(
    `${API_BASE_URL}/read-history?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers,
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch read history: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

/**
 * 检查新闻是否已读
 */
export async function checkReadStatus(
  newsId: string,
  userId?: string,
): Promise<boolean> {
  const sessionId = getSessionId();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
  };

  if (userId) {
    headers['x-user-id'] = userId;
  }

  const response = await fetch(`${API_BASE_URL}/read-history/check/${newsId}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.data?.isRead || false;
}

/**
 * 批量检查已读状态（包含已读时间）
 */
export async function checkMultipleReadStatus(
  newsIds: string[],
  userId?: string,
): Promise<Record<string, { isRead: boolean; readAt?: string }>> {
  if (newsIds.length === 0) {
    return {};
  }

  const sessionId = getSessionId();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
  };

  if (userId) {
    headers['x-user-id'] = userId;
  }

  const response = await fetch(
    `${API_BASE_URL}/read-history/check-multiple?newsIds=${newsIds.join(',')}`,
    {
      method: 'POST',
      headers,
    },
  );

  if (!response.ok) {
    return {};
  }

  const data = await response.json();
  return data.data || {};
}

/**
 * 获取已读统计
 */
export async function getReadStats(userId?: string): Promise<any> {
  const sessionId = getSessionId();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
  };

  if (userId) {
    headers['x-user-id'] = userId;
  }

  const response = await fetch(`${API_BASE_URL}/read-history/stats`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    return {
      totalRead: 0,
      todayRead: 0,
      weekRead: 0,
      avgReadDuration: 0,
    };
  }

  const data = await response.json();
  return data.data;
}
