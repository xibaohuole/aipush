/**
 * 会话ID管理工具
 * 用于匿名用户跟踪
 */

const SESSION_ID_KEY = 'aipush_session_id';

/**
 * 生成唯一会话ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 获取或创建会话ID
 */
export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);

  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }

  return sessionId;
}

/**
 * 清除会话ID
 */
export function clearSessionId(): void {
  localStorage.removeItem(SESSION_ID_KEY);
}

/**
 * 重置会话ID（生成新的）
 */
export function resetSessionId(): string {
  const newSessionId = generateSessionId();
  localStorage.setItem(SESSION_ID_KEY, newSessionId);
  return newSessionId;
}
