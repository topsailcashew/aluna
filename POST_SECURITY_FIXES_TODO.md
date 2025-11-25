# Post-Security Fixes TODO

## ⚠️ CRITICAL - DO IMMEDIATELY

### 1. Revoke Exposed API Keys
- [ ] Visit https://console.cloud.google.com/apis/credentials
- [ ] Delete these exposed keys:
  - `AIzaSyDuQf1wyv38-AjvLB4BlPZeMQ-siMCr3-E`
  - `AIzaSyCbGZr2AvcE--wuV9-BaHAxB69c-w1NL0A`
- [ ] Generate NEW API key with restrictions
- [ ] Add new key to `.env.local` file

### 2. Configure Firebase Admin SDK
- [ ] Go to [Firebase Console](https://console.firebase.google.com/)
- [ ] Navigate to Project Settings > Service Accounts
- [ ] Click "Generate New Private Key"
- [ ] Download the JSON file
- [ ] Base64 encode it: `cat serviceAccountKey.json | base64`
- [ ] Add to `.env.local` as `FIREBASE_SERVICE_ACCOUNT_KEY=<base64_string>`

### 3. Update Client-Side Code
**BREAKING CHANGE**: All API routes now require authentication

- [ ] Read [CLIENT_UPDATE_GUIDE.md](./CLIENT_UPDATE_GUIDE.md)
- [ ] Search codebase for `fetch('/api/`
- [ ] Update ALL API calls to use `authenticatedFetch` from `@/lib/api-client`
- [ ] Remove `userId` from request bodies (now from token)
- [ ] Update error handling for 401 and 429 responses

**Files likely needing updates:**
- `src/components/life-messages/LifeMessagesWizard.tsx`
- `src/app/life-messages/page.tsx`
- Any component calling AI endpoints
- Dashboard components

## 🔧 IMPORTANT - Before Deployment

### 4. Test All Functionality
- [ ] Sign in and make API calls (should work)
- [ ] Sign out and try API calls (should get 401)
- [ ] Test rate limiting (make many rapid requests)
- [ ] Test error handling
- [ ] Verify CORS works correctly
- [ ] Test all user flows end-to-end

### 5. Configure Production Environment
- [ ] Add `FIREBASE_SERVICE_ACCOUNT_KEY` to production env vars
- [ ] Add new `GOOGLE_GENAI_API_KEY` to production env vars
- [ ] Add `NEXT_PUBLIC_FIREBASE_*` variables to production
- [ ] (Optional) Add `ALLOWED_ORIGINS` for CSRF protection
- [ ] Verify HTTPS is enabled
- [ ] Check security headers are applied

### 6. Deploy Firestore Security Rules
```bash
firebase deploy --only firestore:rules
```

### 7. Configure API Key Restrictions
In Google Cloud Console for the NEW API key:
- [ ] Set Application Restrictions (HTTP referrers or IP addresses)
- [ ] Set API Restrictions (only "Generative Language API")
- [ ] Set Usage Quotas to prevent abuse
- [ ] Monitor usage regularly

## 📊 Recommended - After Deployment

### 8. Set Up Monitoring
- [ ] Configure error monitoring (Sentry, LogRocket, etc.)
- [ ] Set up alerts for authentication failures
- [ ] Monitor rate limit violations
- [ ] Track API usage and costs
- [ ] Set up uptime monitoring

### 9. Security Monitoring
- [ ] Monitor `aiUsage` collection for suspicious activity
- [ ] Check Firebase Authentication logs regularly
- [ ] Review API access patterns
- [ ] Set up alerts for unusual usage spikes

### 10. Documentation
- [ ] Update team documentation with security practices
- [ ] Document incident response procedures
- [ ] Share security documentation with team
- [ ] Schedule regular security reviews

## 🎓 Optional - Security Enhancements

### 11. Additional Security Measures (Consider for Future)
- [ ] Implement Firebase App Check for additional API protection
- [ ] Add request logging for audit trail
- [ ] Implement IP-based rate limiting for additional protection
- [ ] Set up automated security scanning (Snyk, Dependabot)
- [ ] Configure WAF (Web Application Firewall) if using CDN
- [ ] Implement session management with refresh tokens
- [ ] Add two-factor authentication option
- [ ] Encrypt sensitive data at rest in Firestore

### 12. Performance Monitoring
- [ ] Monitor API response times
- [ ] Track authentication overhead
- [ ] Optimize rate limit queries if needed
- [ ] Monitor Firestore read/write costs

## 📋 Verification Checklist

Before marking this complete:

- [ ] All exposed API keys revoked
- [ ] New API keys generated with restrictions
- [ ] Firebase Admin SDK configured
- [ ] All client-side API calls updated
- [ ] All tests pass
- [ ] Type checking passes (`npm run typecheck`)
- [ ] Security audit shows 0 vulnerabilities (`npm audit`)
- [ ] Production environment variables configured
- [ ] HTTPS enabled and working
- [ ] Security headers verified
- [ ] Rate limiting tested
- [ ] Error handling tested
- [ ] Team briefed on changes
- [ ] Documentation updated
- [ ] Monitoring configured

## 🚀 Deployment Steps

1. **Pre-deployment**
   - Complete all CRITICAL tasks above
   - Run full test suite
   - Review code changes
   - Prepare rollback plan

2. **Deployment**
   - Deploy to staging first
   - Test thoroughly in staging
   - Monitor for errors
   - Deploy to production
   - Monitor closely

3. **Post-deployment**
   - Verify all functionality works
   - Check monitoring dashboards
   - Monitor error rates
   - Check API usage
   - Collect user feedback

## 📞 Support Resources

- [SECURITY_FIXES_SUMMARY.md](./SECURITY_FIXES_SUMMARY.md) - What was fixed
- [SECURITY_IMPLEMENTATION.md](./SECURITY_IMPLEMENTATION.md) - Implementation details
- [CLIENT_UPDATE_GUIDE.md](./CLIENT_UPDATE_GUIDE.md) - Client-side migration
- [SECURITY_NOTICE.md](./SECURITY_NOTICE.md) - API key revocation
- [SECURITY.md](./SECURITY.md) - Security policy

## ⏰ Estimated Timeline

- **Critical Tasks**: 2-4 hours
- **Client Updates**: 4-8 hours (depending on codebase size)
- **Testing**: 2-4 hours
- **Deployment**: 1-2 hours
- **Total**: 1-2 days

## ✅ When You're Done

Once all tasks are complete:
1. Mark all checkboxes above
2. Archive this file or move to `docs/completed/`
3. Schedule next security review (recommended: quarterly)
4. Celebrate! 🎉 Your app now has enterprise-grade security.

---

**Created**: 2025-11-25
**Priority**: URGENT
**Owner**: [Your Name/Team]
