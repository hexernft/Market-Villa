# Market Villa Next Steps

## Completed in this package

- Fixed TypeScript parse errors in Paystack verification.
- Rebuilt `lib/business-actions.ts` to remove duplicate exported functions.
- Normalized source files to UTF-8.
- Added homepage Business Types and FAQ side by side.
- Added Help Center page at `/help`.
- Added Status page at `/status`.
- Added global support widget.
- Added sample data option to onboarding.
- Added Admin publish/unpublish button for businesses.
- Fixed ESLint flat config and Next build lint handling.

## Paused for later

- Subscription enforcement testing with expired/grace-period SQL.
- Admin override for expired businesses.
- Full recurring Paystack subscription plans.
- WhatsApp/email dunning reminders.

## Recommended next implementation order

1. Finish Admin Override.
2. Add Paystack recurring subscriptions or monthly renewal records.
3. Add renewal reminder route.
4. Add basic analytics and dashboard activity feed.
5. Add product variants and stock tracking.
