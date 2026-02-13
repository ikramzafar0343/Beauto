# Payment System Setup Guide

This guide explains how to set up the payment system with Stripe integration.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Stripe API keys (available in Stripe Dashboard → Developers → API keys)

## Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Supabase (if not already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Getting Stripe Keys

1. **Publishable Key** (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`):
   - Go to Stripe Dashboard → Developers → API keys
   - Copy the "Publishable key" (starts with `pk_test_` for test mode or `pk_live_` for live mode)

2. **Secret Key** (`STRIPE_SECRET_KEY`):
   - In the same page, copy the "Secret key" (starts with `sk_test_` for test mode or `sk_live_` for live mode)
   - ⚠️ **Never expose this key in client-side code!**

3. **Webhook Secret** (`STRIPE_WEBHOOK_SECRET`):
   - Go to Stripe Dashboard → Developers → Webhooks
   - Click "Add endpoint"
   - Set endpoint URL to: `https://your-domain.com/api/payment/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the "Signing secret" (starts with `whsec_`)

## Database Setup

Run the subscription migration:

```sql
-- Run this in your Supabase SQL Editor
-- File: supabase/migrations/003_user_subscriptions.sql
```

This creates the `user_subscriptions` table to track user payment plans.

## Payment Flow

1. **User Signs Up**: User creates an account via `/auth/sign-up`
2. **Plan Selection**: If a plan is specified in the URL (`?plan=starter` or `?plan=pro`), the payment modal appears
3. **Payment Processing**: User enters card details and completes payment via Stripe
4. **Webhook Processing**: Stripe sends a webhook to `/api/payment/webhook` to update subscription status
5. **Credit Activation**: User's credits are updated based on their plan:
   - **Free**: 200 credits per day
   - **Starter**: 1000 credits per month
   - **Pro**: 5000 credits per month
   - **Enterprise**: 10000 credits per month

## Pricing Plans

- **Starter**: $50/month or $500/year
- **Pro**: $125/month or $1250/year
- **Enterprise**: Custom pricing (contact sales)

## Testing

### Test Cards

Use these test card numbers in Stripe test mode:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any postal code.

### Testing Webhooks Locally

For local development, use Stripe CLI:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/payment/webhook
```

The CLI will provide a webhook secret starting with `whsec_` - use this for `STRIPE_WEBHOOK_SECRET` in local development.

## API Routes

- `POST /api/payment/create-intent` - Creates a Stripe payment intent
- `POST /api/payment/webhook` - Handles Stripe webhook events
- `GET /api/subscription/check` - Checks user's subscription status

## Components

- `PaymentModal` (`src/components/payment/PaymentModal.tsx`) - Payment form with Stripe Elements

## Credit System

The credit system automatically adjusts based on subscription:

- **Free users**: 200 credits per day (resets daily)
- **Paid users**: Credits based on plan (resets monthly with subscription)

Credits are deducted when users:
- Send messages in chat (25 credits per message)
- Execute workflows
- Use AI features

## Troubleshooting

### Payment Intent Creation Fails

- Check that `STRIPE_SECRET_KEY` is set correctly
- Verify the plan name matches: `starter` or `pro`
- Check server logs for detailed error messages

### Webhook Not Working

- Verify `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint secret
- Check that webhook endpoint URL is correct in Stripe Dashboard
- Ensure webhook events are selected: `payment_intent.succeeded`, `payment_intent.payment_failed`
- For local testing, use Stripe CLI to forward webhooks

### Credits Not Updating After Payment

- Check webhook logs in Stripe Dashboard
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Check that `user_subscriptions` table exists and has proper RLS policies
- Verify the webhook handler is updating both `user_subscriptions` and `user_credits` tables

## Production Deployment

1. Switch to Stripe live mode
2. Update environment variables with live keys
3. Update webhook endpoint URL to production domain
4. Test payment flow with real card (use small amount first)
5. Monitor webhook events in Stripe Dashboard
