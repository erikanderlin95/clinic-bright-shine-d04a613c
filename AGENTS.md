# Architecture rules

- Keep queue visibility defaults and persistence in `src/lib/queue-visibility.ts`; settings and patient views must resolve the same preference.
- Filter walk-in history through `src/lib/walkin-records.ts` for both display and CSV export so both cover the same 30 calendar days.