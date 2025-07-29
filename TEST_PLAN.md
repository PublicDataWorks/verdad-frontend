# Onboarding Page Email Field Test Plan

## Test Scenarios

### 1. Normal Login Flow (Control Test)
- [ ] Log in with existing credentials
- [ ] Navigate to /onboarding
- [ ] Verify email is populated and disabled
- [ ] Complete profile setup successfully

### 2. Email Confirmation Flow (Kira's Issue)
- [ ] Sign up with a new email
- [ ] Click email confirmation link
- [ ] Land on /onboarding
- [ ] Check console for auth state logs
- [ ] Verify email field behavior:
  - If session exists: Email should auto-populate
  - If no session after 3 seconds: Email field becomes editable for manual entry

### 3. Magic Link Flow
- [ ] Request a magic link
- [ ] Click the magic link
- [ ] Observe auth state changes in console
- [ ] Verify email populates when auth completes

### 4. Manual Email Entry (Fallback)
- [ ] Navigate to /onboarding without session
- [ ] Verify email field is editable (not disabled)
- [ ] Enter email manually
- [ ] Complete form submission

### 5. Edge Cases
- [ ] Test with invalid email format
- [ ] Test with network interruption
- [ ] Test rapid navigation/refresh
- [ ] Test with multiple tabs open

## Console Logs to Monitor

1. Look for: "Auth state changed:" messages
2. Check for: "No session found, redirecting to login"
3. Monitor for any error messages

## Testing Steps

### Local Testing
1. Open browser console
2. Clear all cookies/storage for localhost
3. Test each scenario above
4. Document any issues

### Staging Testing
1. Deploy to a staging environment
2. Test with real Supabase email flows
3. Have team members test different scenarios
4. Get Kira to test her specific flow

## Success Criteria
- [ ] Email field properly populates for authenticated users
- [ ] Email field is editable when empty (fallback works)
- [ ] No console errors
- [ ] Smooth UX with appropriate loading states
- [ ] All auth flows work correctly