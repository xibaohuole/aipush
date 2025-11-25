# Security Policy

## 🔒 Environment Variables & API Keys

### Critical Rules
1. **NEVER commit `.env` files** to Git
2. **NEVER hardcode API keys** in source code
3. **NEVER share API keys** in issues, PRs, or public channels
4. **ALWAYS use `.env.example`** as template (with placeholder values)

### Setup Process
1. Copy `.env.example` to `.env`
2. Fill in real values in `.env`
3. Verify `.env` is in `.gitignore`
4. Add secrets to GitHub Actions via Settings → Secrets

### API Keys Used in This Project
- `VITE_GLM_API_KEY` - 智谱AI (GLM) API key for AI analysis
- `GLM_API_KEY` - Backend version of GLM API key
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JSON Web Token signing key
- `REDIS_PASSWORD` - Redis authentication (if configured)

## 🚨 If API Key Leaked

If you accidentally commit an API key:

1. **Revoke the key immediately** at the provider's dashboard
2. **Generate a new key**
3. **Remove from Git history**:
   ```bash
   git rm --cached path/to/.env
   git commit -m "security: Remove leaked credentials"
   git push
   ```
4. **Update GitHub Secrets** with new key
5. **Update local `.env` files** with new key

## 🛡️ Protected Files

These files are protected by `.gitignore`:
- `.env` and all `.env.*` variations
- `*.pem`, `*.key`, `*.cert` - Certificate files
- `secrets/` directories
- Temporary files (`nul`, `*.tmp`)

## ✅ Safe to Commit

These files CAN be committed:
- `.env.example` - Template with placeholder values
- `.env.template` - Alternative template format
- Source code (without hardcoded secrets)
- Documentation

## 📋 Pre-Commit Checklist

Before each commit, verify:
- [ ] No `.env` files staged
- [ ] No API keys in code
- [ ] No database passwords in code
- [ ] `.env.example` has placeholder values only
- [ ] Sensitive data moved to environment variables

## 🔐 GitHub Actions Secrets

Required secrets in GitHub repository settings:
- `VITE_GLM_API_KEY` - For production deployments
- `DATABASE_URL` - If deploying backend
- Additional secrets as needed per environment

## 📞 Reporting Security Issues

If you discover a security vulnerability, please email: [your-email@domain.com]

**DO NOT** create a public GitHub issue for security vulnerabilities.
