# Architecture rules

- Keep queue visibility defaults and persistence in `src/lib/queue-visibility.ts`; settings and patient views must resolve the same preference.
- Filter walk-in history through `src/lib/walkin-records.ts` for both display and CSV export so both cover the same 30 calendar days.
- Keep mobile layouts in existing components: table scrolling stays within its container, patient details fill the phone screen, and shared dialogs fit the visible viewport so workflows need no separate business logic.
- Keep demo subscription tiers in `src/lib/subscription-plans.ts`; the Payment & Subscription panel must not collect card data or claim payment changes before a payment service is connected.