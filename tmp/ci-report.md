# Temporary CI Report

Commit: cff4069c463a09e9e14763cd27723b1f5c67431b
Generated: 2026-05-04T21:24:20Z

## npm ci

```text
npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
npm warn deprecated abab@2.0.6: Use your platform's native atob() and btoa() methods instead
npm warn deprecated domexception@4.0.0: Use your platform's native DOMException instead

added 593 packages, and audited 594 packages in 13s

106 packages are looking for funding
  run `npm fund` for details

18 vulnerabilities (3 low, 7 moderate, 8 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

Exit code: 0

## typecheck

```text

> vite_react_shadcn_ts@0.0.0 typecheck
> tsc -b --pretty false

```

Exit code: 0

## lint

```text

> vite_react_shadcn_ts@0.0.0 lint
> eslint .


/home/runner/work/photo-brief/photo-brief/remotion/src/components/SpotlightPrimitives.tsx
    5:17  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components
  120:17  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/src/components/marketing/HowItWorksSteps.tsx
  3:14  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/src/components/marketing/QuotableFacts.tsx
  6:14  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/src/components/ui/badge.tsx
  29:17  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/src/components/ui/button.tsx
  54:18  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/src/components/ui/form.tsx
  129:10  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/src/components/ui/navigation-menu.tsx
  111:3  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/src/components/ui/sidebar.tsx
  636:3  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/src/components/ui/sonner.tsx
  35:19  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/src/components/ui/toggle.tsx
  37:18  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/src/features/capture/RecipientBrandingContext.tsx
  26:17  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/src/features/guides/pages/GuideDetailPage.tsx
  72:6  warning  React Hook useEffect has a missing dependency: 'guide'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/photo-brief/photo-brief/src/features/requests/components/InboxFilters.tsx
   26:14  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components
  127:17  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/src/features/requests/components/ManualSmsShareCard.tsx
  27:17  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/src/features/submissions/pages/SubmissionReviewPage.tsx
  458:3  warning  React Hook "useEffect" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks

/home/runner/work/photo-brief/photo-brief/src/features/workspace/pages/OnboardingPage.tsx
  104:6  warning  React Hook useEffect has a missing dependency: 'user'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

/home/runner/work/photo-brief/photo-brief/src/hooks/seo/usePageMeta.tsx
  58:7   warning  Unused eslint-disable directive (no problems were reported from 'no-console')
  62:7   warning  Unused eslint-disable directive (no problems were reported from 'no-console')
  96:17  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/src/hooks/useAuth.tsx
  63:17  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/src/pages/Auth.tsx
  33:29  warning  React Hook "useState" is called conditionally. React Hooks must be called in the exact same order in every component render   react-hooks/rules-of-hooks
  34:35  warning  React Hook "useState" is called conditionally. React Hooks must be called in the exact same order in every component render   react-hooks/rules-of-hooks
  35:27  warning  React Hook "useState" is called conditionally. React Hooks must be called in the exact same order in every component render   react-hooks/rules-of-hooks
  36:39  warning  React Hook "useState" is called conditionally. React Hooks must be called in the exact same order in every component render   react-hooks/rules-of-hooks
  39:3   warning  React Hook "useEffect" is called conditionally. React Hooks must be called in the exact same order in every component render  react-hooks/rules-of-hooks

/home/runner/work/photo-brief/photo-brief/src/pages/Signup.tsx
  57:29  warning  React Hook "useState" is called conditionally. React Hooks must be called in the exact same order in every component render   react-hooks/rules-of-hooks
  58:27  warning  React Hook "useState" is called conditionally. React Hooks must be called in the exact same order in every component render   react-hooks/rules-of-hooks
  59:35  warning  React Hook "useState" is called conditionally. React Hooks must be called in the exact same order in every component render   react-hooks/rules-of-hooks
  60:39  warning  React Hook "useState" is called conditionally. React Hooks must be called in the exact same order in every component render   react-hooks/rules-of-hooks
  62:3   warning  React Hook "useEffect" is called conditionally. React Hooks must be called in the exact same order in every component render  react-hooks/rules-of-hooks

/home/runner/work/photo-brief/photo-brief/src/services/notificationService.ts
  156:3  warning  Unused eslint-disable directive (no problems were reported from 'no-console')
  168:3  warning  Unused eslint-disable directive (no problems were reported from 'no-console')
  178:3  warning  Unused eslint-disable directive (no problems were reported from 'no-console')

/home/runner/work/photo-brief/photo-brief/supabase/functions/_shared/transactional-email-templates/recipient-reminder.tsx
  15:7  warning  Fast refresh only works when a file only exports components. Move your component(s) to a separate file  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/supabase/functions/_shared/transactional-email-templates/recipient-request-link.tsx
  25:7  warning  Fast refresh only works when a file only exports components. Move your component(s) to a separate file  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/supabase/functions/_shared/transactional-email-templates/submission-received.tsx
  16:7  warning  Fast refresh only works when a file only exports components. Move your component(s) to a separate file  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/supabase/functions/_shared/transactional-email-templates/waitlist-admin-notification.tsx
  21:7  warning  Fast refresh only works when a file only exports components. Move your component(s) to a separate file  react-refresh/only-export-components
  31:7  warning  Fast refresh only works when a file only exports components. Move your component(s) to a separate file  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/supabase/functions/_shared/transactional-email-templates/waitlist-confirmation.tsx
  12:7  warning  Fast refresh only works when a file only exports components. Move your component(s) to a separate file  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/supabase/functions/_shared/transactional-email-templates/workspace-welcome.tsx
  13:7  warning  Fast refresh only works when a file only exports components. Move your component(s) to a separate file  react-refresh/only-export-components

✖ 42 problems (0 errors, 42 warnings)
  0 errors and 5 warnings potentially fixable with the `--fix` option.

```

Exit code: 0

## test

```text

> vite_react_shadcn_ts@0.0.0 test
> vitest run


[1m[46m RUN [49m[22m [36mv3.2.4 [39m[90m/home/runner/work/photo-brief/photo-brief[39m

 [32m✓[39m src/test/example.test.ts [2m([22m[2m1 test[22m[2m)[22m[32m 2[2mms[22m[39m

[2m Test Files [22m [1m[32m1 passed[39m[22m[90m (1)[39m
[2m      Tests [22m [1m[32m1 passed[39m[22m[90m (1)[39m
[2m   Start at [22m 21:24:49
[2m   Duration [22m 742ms[2m (transform 26ms, setup 56ms, collect 7ms, tests 2ms, environment 349ms, prepare 143ms)[22m

```

Exit code: 0

## build

```text

> vite_react_shadcn_ts@0.0.0 build
> vite build

[36mvite v5.4.19 [32mbuilding for production...[36m[39m
transforming...
Browserslist: browsers data (caniuse-lite) is 11 months old. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
[32m✓[39m 2296 modules transformed.
rendering chunks...
computing gzip size...
[2mdist/[22m[32mindex.html                                  [39m[1m[2m  4.23 kB[22m[1m[22m[2m │ gzip:   1.33 kB[22m
[2mdist/[22m[2massets/[22m[32mno-keys-BGMicyfS.png                 [39m[1m[2m 32.38 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[32mno-team-D1Jh2WgI.png                 [39m[1m[2m 34.39 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[32mno-guides-Cb7arpBn.png               [39m[1m[2m 43.31 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[32mappliances-Byu61byn.jpg              [39m[1m[2m118.05 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[32mdriveway-access-BKpyvMbc.jpg         [39m[1m[2m129.07 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[32mpile-closeup-IrL4MiY5.jpg            [39m[1m[2m130.61 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[32mwide-garage-CXfvQLmS.jpg             [39m[1m[2m131.52 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[35mindex-kcmNad4T.css                   [39m[1m[2m141.64 kB[22m[1m[22m[2m │ gzip:  24.24 kB[22m
[2mdist/[22m[2massets/[22m[36mindex-5kNXxmBF.js                    [39m[1m[2m  0.28 kB[22m[1m[22m[2m │ gzip:   0.21 kB[22m[2m │ map:     0.93 kB[22m
[2mdist/[22m[2massets/[22m[36mformat-CfHXEHKo.js                   [39m[1m[2m  0.31 kB[22m[1m[22m[2m │ gzip:   0.24 kB[22m[2m │ map:     1.19 kB[22m
[2mdist/[22m[2massets/[22m[36mPlanTag-DuWBOzLd.js                  [39m[1m[2m  0.37 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m[2m │ map:     1.28 kB[22m
[2mdist/[22m[2massets/[22m[36museGuides-Bhz6UFDN.js                [39m[1m[2m  0.38 kB[22m[1m[22m[2m │ gzip:   0.27 kB[22m[2m │ map:     2.51 kB[22m
[2mdist/[22m[2massets/[22m[36mpdfService-COHZM1qM.js               [39m[1m[2m  0.38 kB[22m[1m[22m[2m │ gzip:   0.28 kB[22m[2m │ map:     1.19 kB[22m
[2mdist/[22m[2massets/[22m[36msearch-DBFl6_co.js                   [39m[1m[2m  0.39 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m[2m │ map:     0.88 kB[22m
[2mdist/[22m[2massets/[22m[36mclock-BMO1gqNC.js                    [39m[1m[2m  0.40 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m[2m │ map:     0.89 kB[22m
[2mdist/[22m[2massets/[22m[36museRequests-CNKGYxzX.js              [39m[1m[2m  0.41 kB[22m[1m[22m[2m │ gzip:   0.29 kB[22m[2m │ map:     1.82 kB[22m
[2mdist/[22m[2massets/[22m[36mcopy--6kPvgJ-.js                     [39m[1m[2m  0.45 kB[22m[1m[22m[2m │ gzip:   0.34 kB[22m[2m │ map:     0.97 kB[22m
[2mdist/[22m[2massets/[22m[36meye-DMNkEBSZ.js                      [39m[1m[2m  0.47 kB[22m[1m[22m[2m │ gzip:   0.34 kB[22m[2m │ map:     0.98 kB[22m
[2mdist/[22m[2massets/[22m[36marchive-Cd9JgH6g.js                  [39m[1m[2m  0.47 kB[22m[1m[22m[2m │ gzip:   0.34 kB[22m[2m │ map:     1.06 kB[22m
[2mdist/[22m[2massets/[22m[36mexternal-link-D_xSzqvw.js            [39m[1m[2m  0.47 kB[22m[1m[22m[2m │ gzip:   0.34 kB[22m[2m │ map:     1.04 kB[22m
[2mdist/[22m[2massets/[22m[36mclipboard-BM-QeutC.js                [39m[1m[2m  0.47 kB[22m[1m[22m[2m │ gzip:   0.34 kB[22m[2m │ map:     1.06 kB[22m
[2mdist/[22m[2massets/[22m[36mpencil-CIgmb48j.js                   [39m[1m[2m  0.49 kB[22m[1m[22m[2m │ gzip:   0.36 kB[22m[2m │ map:     0.99 kB[22m
[2mdist/[22m[2massets/[22m[36mlightbulb-BJNaQLIx.js                [39m[1m[2m  0.50 kB[22m[1m[22m[2m │ gzip:   0.36 kB[22m[2m │ map:     1.08 kB[22m
[2mdist/[22m[2massets/[22m[36mlayout-template-G7P3CFI-.js          [39m[1m[2m  0.51 kB[22m[1m[22m[2m │ gzip:   0.33 kB[22m[2m │ map:     1.25 kB[22m
[2mdist/[22m[2massets/[22m[36muser-plus-DyJ3mFsT.js                [39m[1m[2m  0.53 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m[2m │ map:     1.24 kB[22m
[2mdist/[22m[2massets/[22m[36mplug-zap-DTtj6Q38.js                 [39m[1m[2m  0.57 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m[2m │ map:     1.25 kB[22m
[2mdist/[22m[2massets/[22m[36mtrash-2-BYSGOqD6.js                  [39m[1m[2m  0.57 kB[22m[1m[22m[2m │ gzip:   0.39 kB[22m[2m │ map:     1.32 kB[22m
[2mdist/[22m[2massets/[22m[36mReadinessScoreBadge-w0wLBe1h.js      [39m[1m[2m  0.58 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m[2m │ map:     1.35 kB[22m
[2mdist/[22m[2massets/[22m[36mphone-DHTQwabj.js                    [39m[1m[2m  0.61 kB[22m[1m[22m[2m │ gzip:   0.39 kB[22m[2m │ map:     1.04 kB[22m
[2mdist/[22m[2massets/[22m[36mbuilding-2-CluOGomT.js               [39m[1m[2m  0.66 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m[2m │ map:     1.46 kB[22m
[2mdist/[22m[2massets/[22m[36mstatusOptions-3W9GPB6v.js            [39m[1m[2m  0.68 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m[2m │ map:     1.95 kB[22m
[2mdist/[22m[2massets/[22m[36mPageHeader-B6qUd0O3.js               [39m[1m[2m  0.70 kB[22m[1m[22m[2m │ gzip:   0.41 kB[22m[2m │ map:     2.20 kB[22m
[2mdist/[22m[2massets/[22m[36mbadge-BWP5vI0i.js                    [39m[1m[2m  0.75 kB[22m[1m[22m[2m │ gzip:   0.41 kB[22m[2m │ map:     1.65 kB[22m
[2mdist/[22m[2massets/[22m[36mwrench-0eeeGeaP.js                   [39m[1m[2m  0.79 kB[22m[1m[22m[2m │ gzip:   0.42 kB[22m[2m │ map:     1.74 kB[22m
[2mdist/[22m[2massets/[22m[36mStatusBadge-CZp0r-_U.js              [39m[1m[2m  0.95 kB[22m[1m[22m[2m │ gzip:   0.47 kB[22m[2m │ map:     2.31 kB[22m
[2mdist/[22m[2massets/[22m[36mmessagingService-DouBrgRL.js         [39m[1m[2m  1.47 kB[22m[1m[22m[2m │ gzip:   0.69 kB[22m[2m │ map:     5.34 kB[22m
[2mdist/[22m[2massets/[22m[36mEmptyState-DiAIWMiI.js               [39m[1m[2m  1.51 kB[22m[1m[22m[2m │ gzip:   0.75 kB[22m[2m │ map:     4.98 kB[22m
[2mdist/[22m[2massets/[22m[36mAcceptInvitePage-DrQ6G_HQ.js         [39m[1m[2m  1.59 kB[22m[1m[22m[2m │ gzip:   0.82 kB[22m[2m │ map:     3.96 kB[22m
[2mdist/[22m[2massets/[22m[36mteamService-DPOCOE0j.js              [39m[1m[2m  1.65 kB[22m[1m[22m[2m │ gzip:   0.73 kB[22m[2m │ map:     5.82 kB[22m
[2mdist/[22m[2massets/[22m[36msmsConfigService-DLZAogNS.js         [39m[1m[2m  1.74 kB[22m[1m[22m[2m │ gzip:   0.70 kB[22m[2m │ map:     5.76 kB[22m
[2mdist/[22m[2massets/[22m[36mswitch-DUZtXXuE.js                   [39m[1m[2m  2.53 kB[22m[1m[22m[2m │ gzip:   1.28 kB[22m[2m │ map:     9.86 kB[22m
[2mdist/[22m[2massets/[22m[36museUsage-Dik6v_jd.js                 [39m[1m[2m  2.56 kB[22m[1m[22m[2m │ gzip:   0.99 kB[22m[2m │ map:     9.81 kB[22m
[2mdist/[22m[2massets/[22m[36museMutation-BXN5dOG4.js              [39m[1m[2m  2.93 kB[22m[1m[22m[2m │ gzip:   1.26 kB[22m[2m │ map:     8.41 kB[22m
[2mdist/[22m[2massets/[22m[36mrequestsService-JHDSeRNY.js          [39m[1m[2m  3.42 kB[22m[1m[22m[2m │ gzip:   1.11 kB[22m[2m │ map:    10.55 kB[22m
[2mdist/[22m[2massets/[22m[36museTeamMembers-Dnk5xRm8.js           [39m[1m[2m  4.54 kB[22m[1m[22m[2m │ gzip:   2.06 kB[22m[2m │ map:    18.18 kB[22m
[2mdist/[22m[2massets/[22m[36mCustomersPage-BhuDSuFa.js            [39m[1m[2m  4.86 kB[22m[1m[22m[2m │ gzip:   1.88 kB[22m[2m │ map:    12.75 kB[22m
[2mdist/[22m[2massets/[22m[36mMessageTemplatesPage-enbNCHQB.js     [39m[1m[2m  5.40 kB[22m[1m[22m[2m │ gzip:   2.11 kB[22m[2m │ map:    16.05 kB[22m
[2mdist/[22m[2massets/[22m[36mGuideBuilderPage-ToUXj85d.js         [39m[1m[2m  5.47 kB[22m[1m[22m[2m │ gzip:   2.18 kB[22m[2m │ map:    13.35 kB[22m
[2mdist/[22m[2massets/[22m[36mGuideLibraryPage-CMUzbBIy.js         [39m[1m[2m  7.12 kB[22m[1m[22m[2m │ gzip:   2.33 kB[22m[2m │ map:    15.63 kB[22m
[2mdist/[22m[2massets/[22m[36mCustomerDetailPage-Bfkx9fMQ.js       [39m[1m[2m  8.08 kB[22m[1m[22m[2m │ gzip:   2.85 kB[22m[2m │ map:    19.24 kB[22m
[2mdist/[22m[2massets/[22m[36mGeneratedQuestionEditor-CewcZdMY.js  [39m[1m[2m  8.47 kB[22m[1m[22m[2m │ gzip:   2.71 kB[22m[2m │ map:    25.14 kB[22m
[2mdist/[22m[2massets/[22m[36mCustomerFormDialog-DM5mGfHS.js       [39m[1m[2m  8.81 kB[22m[1m[22m[2m │ gzip:   2.94 kB[22m[2m │ map:    25.99 kB[22m
[2mdist/[22m[2massets/[22m[36mAdminAIRerun-BPm2_rvH.js             [39m[1m[2m  9.65 kB[22m[1m[22m[2m │ gzip:   3.20 kB[22m[2m │ map:    26.20 kB[22m
[2mdist/[22m[2massets/[22m[36mGuideDetailPage-BgzN-_5m.js          [39m[1m[2m 10.69 kB[22m[1m[22m[2m │ gzip:   3.64 kB[22m[2m │ map:    35.43 kB[22m
[2mdist/[22m[2massets/[22m[36mBrandSettingsPage-BXRfTuJX.js        [39m[1m[2m 11.38 kB[22m[1m[22m[2m │ gzip:   3.59 kB[22m[2m │ map:    29.06 kB[22m
[2mdist/[22m[2massets/[22m[36mAdminInvites-41m1R3oO.js             [39m[1m[2m 11.83 kB[22m[1m[22m[2m │ gzip:   3.61 kB[22m[2m │ map:    36.83 kB[22m
[2mdist/[22m[2massets/[22m[36mRequestDetailPage-Cw3ZhWmo.js        [39m[1m[2m 11.94 kB[22m[1m[22m[2m │ gzip:   4.63 kB[22m[2m │ map:    34.22 kB[22m
[2mdist/[22m[2massets/[22m[36mSmsSettingsPage-Cfc6ARVa.js          [39m[1m[2m 12.94 kB[22m[1m[22m[2m │ gzip:   4.24 kB[22m[2m │ map:    37.13 kB[22m
[2mdist/[22m[2massets/[22m[36mRequestsInboxPage-B8N--dTa.js        [39m[1m[2m 16.04 kB[22m[1m[22m[2m │ gzip:   4.68 kB[22m[2m │ map:    48.88 kB[22m
[2mdist/[22m[2massets/[22m[36mTeamSettingsPage-bK3HSdAu.js         [39m[1m[2m 17.87 kB[22m[1m[22m[2m │ gzip:   5.58 kB[22m[2m │ map:    50.84 kB[22m
[2mdist/[22m[2massets/[22m[36mDashboardPage-E_IhQpJ7.js            [39m[1m[2m 18.16 kB[22m[1m[22m[2m │ gzip:   5.76 kB[22m[2m │ map:    46.10 kB[22m
[2mdist/[22m[2massets/[22m[36mOnboardingPage-ClEfI9Wb.js           [39m[1m[2m 18.62 kB[22m[1m[22m[2m │ gzip:   4.97 kB[22m[2m │ map:    47.71 kB[22m
[2mdist/[22m[2massets/[22m[36mselect-usmGxYJo.js                   [39m[1m[2m 21.37 kB[22m[1m[22m[2m │ gzip:   7.55 kB[22m[2m │ map:    90.62 kB[22m
[2mdist/[22m[2massets/[22m[36mCreateRequestPage-CogjPdZG.js        [39m[1m[2m 21.97 kB[22m[1m[22m[2m │ gzip:   6.86 kB[22m[2m │ map:    53.16 kB[22m
[2mdist/[22m[2massets/[22m[36mIntegrationsPage-CiWSJkAt.js         [39m[1m[2m 23.47 kB[22m[1m[22m[2m │ gzip:   7.41 kB[22m[2m │ map:    53.48 kB[22m
[2mdist/[22m[2massets/[22m[36mWebsiteIntakePage-Da18WnYr.js        [39m[1m[2m 26.66 kB[22m[1m[22m[2m │ gzip:   7.45 kB[22m[2m │ map:    66.73 kB[22m
[2mdist/[22m[2massets/[22m[36mBillingSettingsPage-CkSuZoDQ.js      [39m[1m[2m 31.43 kB[22m[1m[22m[2m │ gzip:  10.83 kB[22m[2m │ map:   118.20 kB[22m
[2mdist/[22m[2massets/[22m[36mBetaGuidePage-Bw-LV38d.js            [39m[1m[2m 40.52 kB[22m[1m[22m[2m │ gzip:  11.63 kB[22m[2m │ map:    75.83 kB[22m
[2mdist/[22m[2massets/[22m[36mSubmissionReviewPage-Cm1pYNQ_.js     [39m[1m[2m 50.16 kB[22m[1m[22m[2m │ gzip:  14.01 kB[22m[2m │ map:   146.62 kB[22m
[2mdist/[22m[2massets/[22m[36mtypes-CZyzcKJF.js                    [39m[1m[2m 53.46 kB[22m[1m[22m[2m │ gzip:  12.23 kB[22m[2m │ map:   223.44 kB[22m
[2mdist/[22m[2massets/[22m[36mindex-C9kyHcv3.js                    [39m[1m[33m926.03 kB[39m[22m[2m │ gzip: 266.04 kB[22m[2m │ map: 3,574.27 kB[22m
[33m
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.[39m
[32m✓ built in 7.84s[39m
```

Exit code: 0

## Result

PASS
