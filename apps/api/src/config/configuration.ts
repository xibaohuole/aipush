export default () => ({
  // Environment
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),

  // Database
  database: {
    url: process.env.DATABASE_URL,
  },

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
  },

  // OAuth
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
  },

  // GLM AI (智谱AI)
  glm: {
    apiKey: process.env.GLM_API_KEY || process.env.VITE_GLM_API_KEY,
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // Rate limiting
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60000', 10), // 1 minute
    limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests
  },

  // Email (for future implementation)
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@aipulsedaily.com',
  },

  // AWS S3 (for file uploads)
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET,
  },

  // Application
  app: {
    name: 'AI Pulse Daily',
    url: process.env.APP_URL || 'http://localhost:3000',
    apiUrl: process.env.API_URL || 'http://localhost:4000',
  },
});
