-- ==================== AI Pulse Daily Database Schema ====================
-- PostgreSQL 16+
-- Created for enterprise-grade AI news aggregation platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search optimization

-- ==================== Enums ====================

CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator', 'editor');
CREATE TYPE notification_type AS ENUM ('email', 'push', 'in_app');
CREATE TYPE notification_frequency AS ENUM ('daily', 'realtime', 'weekly');
CREATE TYPE news_category AS ENUM (
  'research', 'product', 'finance', 'policy', 'ethics',
  'robotics', 'lifestyle', 'entertainment', 'meme', 'other'
);
CREATE TYPE region AS ENUM ('global', 'north_america', 'europe', 'asia', 'other');
CREATE TYPE view_mode AS ENUM ('card', 'list');
CREATE TYPE theme_mode AS ENUM ('light', 'dark', 'auto');
CREATE TYPE moderator_action_type AS ENUM ('approve', 'reject', 'edit', 'delete', 'pin');
CREATE TYPE entity_type AS ENUM ('news', 'comment', 'user');
CREATE TYPE activity_event_type AS ENUM ('view', 'click', 'bookmark', 'share', 'comment');
CREATE TYPE share_platform AS ENUM ('twitter', 'linkedin', 'facebook', 'email', 'link');

-- ==================== Core Tables ====================

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    role user_role DEFAULT 'user' NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    deleted_at TIMESTAMP, -- Soft delete

    -- Indexes
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT valid_username CHECK (username ~* '^[a-zA-Z0-9_]{3,50}$')
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_username ON users(username) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- User Preferences Table
CREATE TABLE user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_notification BOOLEAN DEFAULT TRUE,
    push_notification BOOLEAN DEFAULT FALSE,
    frequency notification_frequency DEFAULT 'daily',
    categories news_category[] DEFAULT ARRAY['research', 'product', 'finance']::news_category[],
    regions region[] DEFAULT ARRAY['global']::region[],
    language VARCHAR(10) DEFAULT 'en',
    theme theme_mode DEFAULT 'auto',
    view_mode view_mode DEFAULT 'card',
    compact_mode BOOLEAN DEFAULT FALSE,
    font_size VARCHAR(10) DEFAULT 'medium',
    auto_refresh BOOLEAN DEFAULT TRUE,
    refresh_interval INTEGER DEFAULT 30, -- minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News Table
CREATE TABLE news (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    why_it_matters TEXT,
    source VARCHAR(100),
    source_url TEXT UNIQUE NOT NULL,
    category news_category NOT NULL,
    region region DEFAULT 'global',
    impact_score INTEGER CHECK (impact_score BETWEEN 1 AND 10),
    published_at TIMESTAMP NOT NULL,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_custom BOOLEAN DEFAULT FALSE, -- User-submitted news
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    image_url TEXT,
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    citations TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_approved BOOLEAN DEFAULT TRUE,
    is_trending BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,

    CONSTRAINT valid_source_url CHECK (source_url ~* '^https?://'),
    CONSTRAINT valid_impact_score CHECK (impact_score IS NULL OR (impact_score >= 1 AND impact_score <= 10))
);

CREATE INDEX idx_news_category ON news(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_news_region ON news(region) WHERE deleted_at IS NULL;
CREATE INDEX idx_news_published_at ON news(published_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_news_impact_score ON news(impact_score DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_news_trending ON news(is_trending) WHERE is_trending = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_news_tags ON news USING GIN(tags);
CREATE INDEX idx_news_fulltext ON news USING GIN(to_tsvector('english', title || ' ' || summary));

-- Bookmarks Table
CREATE TABLE bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, news_id)
);

CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_news_id ON bookmarks(news_id);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- Comments Table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 5000),
    likes INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_comments_news_id ON comments(news_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);

-- Comment Likes Table
CREATE TABLE comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, comment_id)
);

CREATE INDEX idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX idx_comment_likes_user_id ON comment_likes(user_id);

-- Daily Summaries Table
CREATE TABLE daily_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE UNIQUE NOT NULL,
    headline VARCHAR(255) NOT NULL,
    key_takeaways TEXT[] NOT NULL,
    body_content TEXT NOT NULL,
    trending_topics TEXT[] DEFAULT '{}',
    audio_url TEXT, -- For podcast feature
    news_item_ids UUID[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_summaries_date ON daily_summaries(date DESC);

-- Shares Table
CREATE TABLE shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    news_id UUID NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    platform share_platform NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shares_news_id ON shares(news_id);
CREATE INDEX idx_shares_user_id ON shares(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_shares_created_at ON shares(created_at DESC);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- User Activity (Analytics) Table
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type activity_event_type NOT NULL,
    entity_type entity_type NOT NULL,
    entity_id UUID NOT NULL,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_event_type ON user_activities(event_type);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at DESC);
CREATE INDEX idx_user_activities_entity ON user_activities(entity_type, entity_id);

-- Moderator Actions Table
CREATE TABLE moderator_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    moderator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action moderator_action_type NOT NULL,
    entity_type entity_type NOT NULL,
    entity_id UUID NOT NULL,
    reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_moderator_actions_moderator_id ON moderator_actions(moderator_id);
CREATE INDEX idx_moderator_actions_entity ON moderator_actions(entity_type, entity_id);
CREATE INDEX idx_moderator_actions_created_at ON moderator_actions(created_at DESC);

-- Refresh Tokens Table (for JWT refresh)
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token) WHERE revoked_at IS NULL;
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- API Keys Table (for external integrations)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash) WHERE revoked_at IS NULL;

-- ==================== Triggers ====================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_summaries_updated_at BEFORE UPDATE ON daily_summaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-increment counters
CREATE OR REPLACE FUNCTION increment_news_view_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.event_type = 'view' AND NEW.entity_type = 'news' THEN
        UPDATE news SET view_count = view_count + 1 WHERE id = NEW.entity_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_news_view_count
    AFTER INSERT ON user_activities
    FOR EACH ROW EXECUTE FUNCTION increment_news_view_count();

-- Auto-update comment count
CREATE OR REPLACE FUNCTION update_news_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.deleted_at IS NULL THEN
        UPDATE news SET comment_count = comment_count + 1 WHERE id = NEW.news_id;
    ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL) THEN
        UPDATE news SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = COALESCE(NEW.news_id, OLD.news_id);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_news_comment_count
    AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_news_comment_count();

-- Auto-update bookmark count
CREATE OR REPLACE FUNCTION update_news_bookmark_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE news SET bookmark_count = bookmark_count + 1 WHERE id = NEW.news_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE news SET bookmark_count = GREATEST(bookmark_count - 1, 0) WHERE id = OLD.news_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_news_bookmark_count
    AFTER INSERT OR DELETE ON bookmarks
    FOR EACH ROW EXECUTE FUNCTION update_news_bookmark_count();

-- Auto-update share count
CREATE OR REPLACE FUNCTION update_news_share_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE news SET share_count = share_count + 1 WHERE id = NEW.news_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE news SET share_count = GREATEST(share_count - 1, 0) WHERE id = OLD.news_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_news_share_count
    AFTER INSERT OR DELETE ON shares
    FOR EACH ROW EXECUTE FUNCTION update_news_share_count();

-- Auto-update comment likes count
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comments SET likes = likes + 1 WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comments SET likes = GREATEST(likes - 1, 0) WHERE id = OLD.comment_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_likes_count
    AFTER INSERT OR DELETE ON comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- ==================== Views ====================

-- Trending News View (last 24 hours)
CREATE OR REPLACE VIEW trending_news AS
SELECT
    n.*,
    (n.view_count * 0.3 + n.bookmark_count * 0.3 + n.share_count * 0.2 + n.comment_count * 0.2) AS trending_score
FROM news n
WHERE
    n.deleted_at IS NULL
    AND n.published_at >= CURRENT_TIMESTAMP - INTERVAL '24 hours'
ORDER BY trending_score DESC, n.published_at DESC;

-- User Stats View
CREATE OR REPLACE VIEW user_stats AS
SELECT
    u.id,
    u.username,
    u.email,
    u.role,
    COUNT(DISTINCT b.id) AS bookmark_count,
    COUNT(DISTINCT c.id) AS comment_count,
    COUNT(DISTINCT s.id) AS share_count,
    u.created_at,
    u.last_login_at
FROM users u
LEFT JOIN bookmarks b ON u.id = b.user_id
LEFT JOIN comments c ON u.id = c.user_id
LEFT JOIN shares s ON u.id = s.user_id
WHERE u.deleted_at IS NULL
GROUP BY u.id;

-- ==================== Functions ====================

-- Search news with full-text search
CREATE OR REPLACE FUNCTION search_news(search_query TEXT, limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    summary TEXT,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        n.id,
        n.title,
        n.summary,
        ts_rank(to_tsvector('english', n.title || ' ' || n.summary), plainto_tsquery('english', search_query)) AS relevance
    FROM news n
    WHERE
        n.deleted_at IS NULL
        AND to_tsvector('english', n.title || ' ' || n.summary) @@ plainto_tsquery('english', search_query)
    ORDER BY relevance DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Get user's recommended news based on preferences
CREATE OR REPLACE FUNCTION get_recommended_news(p_user_id UUID, limit_count INTEGER DEFAULT 20)
RETURNS SETOF news AS $$
DECLARE
    user_categories news_category[];
    user_regions region[];
BEGIN
    SELECT categories, regions INTO user_categories, user_regions
    FROM user_preferences
    WHERE user_id = p_user_id;

    RETURN QUERY
    SELECT n.*
    FROM news n
    WHERE
        n.deleted_at IS NULL
        AND (user_categories IS NULL OR n.category = ANY(user_categories))
        AND (user_regions IS NULL OR n.region = ANY(user_regions))
        AND n.id NOT IN (
            SELECT news_id FROM user_activities
            WHERE user_id = p_user_id AND event_type = 'view'
            AND created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
        )
    ORDER BY n.impact_score DESC, n.published_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ==================== Comments ====================

COMMENT ON TABLE users IS 'Core user accounts table';
COMMENT ON TABLE news IS 'AI news articles with metadata';
COMMENT ON TABLE bookmarks IS 'User bookmarks for news items';
COMMENT ON TABLE comments IS 'User comments on news with threading support';
COMMENT ON TABLE daily_summaries IS 'AI-generated daily news summaries';
COMMENT ON TABLE user_activities IS 'User activity tracking for analytics';
COMMENT ON TABLE moderator_actions IS 'Audit log for moderator actions';

-- ==================== Grants (adjust based on your roles) ====================

-- Grant permissions to application role
-- CREATE ROLE aipush_app WITH LOGIN PASSWORD 'your_secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO aipush_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO aipush_app;
