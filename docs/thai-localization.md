# Thai version

Thai is the default language. `src/i18n/index.ts` exports the active catalog and
`th-TH` formatting locale. `src/i18n/th.ts` is checked against the original English
catalog in `src/i18n/en.ts`, including interpolation signatures.

All existing onboarding, family, and older-adult screens use the Thai catalog,
including navigation, validation, accessibility labels, and invitation messages.
The CareCircle brand name stays unchanged. There is no language switch in this
version; the English catalog is retained for future language selection.

Dates display Thai month/day names and Buddhist-era years when a year is shown.
Times use the 24-hour clock. Birthday entry accepts DD/MM/YYYY in either era:
29/02/2543 and 29/02/2000 both save as 2000-02-29. Years from 2443 onwards are
interpreted as Buddhist era; Gregorian birthdays start at 1900. Future birthdays
and invalid dates are rejected. Native task date/time controls follow the browser's
locale support and still submit Gregorian ISO values. Task dates and all database
fields retain their existing formats; no database migration is needed.

The existing IBM Plex Sans Thai font is retained. Thai headings and buttons have
extra line height to accommodate vowel and tone marks.

Known English mock availability/match explanations are translated at display time
in `src/i18n/member-copy.ts`. Custom text, real members' availability, names, and
user-authored activity content are preserved.

Validation:

```sh
npm run build
npm run lint
node --test tests/*.test.mjs
```
