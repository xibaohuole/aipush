import { getSessionId } from '../utils/session';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

/**
 * 添加书签
 */
export async function addBookmark(newsId: string, userId?: string): Promise<void> {
  const sessionId = getSessionId();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
  };

  if (userId) {
    headers['x-user-id'] = userId;
  }

  const response = await fetch(`${API_BASE_URL}/bookmarks/${newsId}`, {
    method: 'POST',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to add bookmark: ${response.status}`);
  }

  return await response.json();
}

/**
 * 移除书签
 */
export async function removeBookmark(newsId: string, userId?: string): Promise<void> {
  const sessionId = getSessionId();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-session-id': sessionId,
  };

  if (userId) {
    headers['x-user-id'] = userId;
  }

  const response = await fetch(`${API_BASE_URL}/bookmarks/${newsId}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to remove bookmark: ${response.status}`);
  }

  return await response.json();
}

/**
 * 获取用户的所有书签
 */
export async function getUserBookmarks(
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
    `${API_BASE_URL}/bookmarks?page=${page}&limit=${limit}`,
    {
      method: 'GET',
      headers,
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch bookmarks: ${response.status}`);
  }

  const data = await response.json();
  return data.data;
}

/**
 * 检查新闻是否被收藏
 */
export async function checkBookmark(
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

  const response = await fetch(`${API_BASE_URL}/bookmarks/check/${newsId}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.data?.isBookmarked || false;
}

/**
 * 批量检查书签状态
 */
export async function checkMultipleBookmarks(
  newsIds: string[],
  userId?: string,
): Promise<Record<string, boolean>> {
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
    `${API_BASE_URL}/bookmarks/check-multiple?newsIds=${newsIds.join(',')}`,
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
