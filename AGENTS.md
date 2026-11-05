# Architecture rules

- Keep queue visibility defaults and persistence in `src/lib/queue-visibility.ts`; settings and patient views must resolve the same preference.
- Filter walk-in history through `src/lib/walkin-records.ts` for both display and CSV export so both cover the same 30 calendar days.
- Keep mobile layouts in existing components: table scrolling stays within its container, patient details fill the phone screen, and shared dialogs fit the visible viewport so workflows need no separate business logic.
- Keep existing billing implementation hidden behind profile settings; label disconnected billing as a demo and never claim real payment changes.
- Keep the clinic-facing two-section portal in `src/components/ClinicPortal.tsx`; preserve the legacy dashboard implementation without mounting its demo data or nonessential features.
- Real portal queue controls require a verified clinic-scoped service with established CMS precedence; explicit demo data and browser-only controls stay isolated in `src/lib/clinic-portal-demo.ts`, never using production writes or global appointment data.