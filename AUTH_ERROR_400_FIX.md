# Fix: 400 Bad Request Error on Sign In

## ✅ Good News: Connection Works!

The error `400 (Bad Request)` means your Supabase connection is working! The issue is with authentication, not connectivity.

## What 400 Bad Request Means

This error typically means one of these:

1. **Invalid email or password** - Wrong credentials
2. **User doesn't exist** - Need to sign up first
3. **Email not verified** - Need to verify email before signing in
4. **Account disabled** - Account has been deactivated

## Solutions

### Solution 1: Check Your Credentials

- Make sure you're using the **correct email** and **password**
- Check for typos (email is case-sensitive)
- Make sure Caps Lock is off

### Solution 2: Sign Up First

If you don't have an account yet:

1. Go to: http://localhost:3000/auth/sign-up
2. Create a new account with your email and password
3. Then try signing in

### Solution 3: Verify Your Email

If you signed up but haven't verified your email:

1. Check your email inbox (and spam folder)
2. Look for an email from Supabase
3. Click the verification link
4. Then try signing in again

### Solution 4: Reset Password

If you forgot your password:

1. Go to Supabase Dashboard: https://app.supabase.com
2. Open your project: `taeqitqdbenjsfrszpbu`
3. Go to: **Authentication** → **Users**
4. Find your user
5. Click **"Reset Password"** or use password reset flow

### Solution 5: Check Email Confirmation Settings

In Supabase Dashboard:

1. Go to: **Authentication** → **Settings**
2. Check **"Enable email confirmations"**
3. If enabled, you must verify email before signing in
4. You can disable it for development (not recommended for production)

## Quick Test: Create New Account

Try creating a new account to test:

1. Go to: http://localhost:3000/auth/sign-up
2. Use a test email and password
3. Sign up
4. Try signing in with those credentials

If this works, the issue is with your original account credentials.

## Common Issues

### Issue: "Invalid login credentials"
**Solution**: Double-check email and password. They must match exactly.

### Issue: "Email not confirmed"
**Solution**: Check your email and click the verification link.

### Issue: "User not found"
**Solution**: You need to sign up first. The account doesn't exist yet.

### Issue: "Too many requests"
**Solution**: Wait a few minutes and try again. You've made too many login attempts.

## Still Not Working?

1. **Check Supabase Dashboard**:
   - Go to: https://app.supabase.com
   - Open project: `taeqitqdbenjsfrszpbu`
   - Go to: **Authentication** → **Users**
   - See if your user exists and is active

2. **Try a different email**:
   - Create a test account with a different email
   - See if that works

3. **Check browser console**:
   - Press F12
   - Look at the Console tab
   - See the full error message

4. **Verify Supabase settings**:
   - Go to: **Authentication** → **Settings**
   - Check email confirmation requirements
   - Check if sign-ups are enabled

## Next Steps

1. Try signing up with a new account
2. If sign-up works, the issue is with your existing account
3. If sign-up also fails, check Supabase project settings
