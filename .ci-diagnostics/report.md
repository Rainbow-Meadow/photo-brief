# CI diagnostics

Commit: 57df500bdb66e4fdc5626f19f1211c1665e8f6f2
Run started: 2026-05-05T03:35:55Z

## npm-ci
```text
npm warn deprecated whatwg-encoding@2.0.0: Use @exodus/bytes instead for a more spec-conformant and faster implementation
npm warn deprecated abab@2.0.6: Use your platform's native atob() and btoa() methods instead
npm warn deprecated domexception@4.0.0: Use your platform's native DOMException instead

added 593 packages, and audited 594 packages in 14s

106 packages are looking for funding
  run `npm fund` for details

18 vulnerabilities (3 low, 7 moderate, 8 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.
```

## typecheck
```text

> vite_react_shadcn_ts@0.0.0 typecheck
> tsc -b --pretty false

```

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

## build
```text

> vite_react_shadcn_ts@0.0.0 build
> vite build

[36mvite v5.4.19 [32mbuilding for production...[36m[39m
transforming...
Browserslist: browsers data (caniuse-lite) is 11 months old. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme
[32m✓[39m 2298 modules transformed.
rendering chunks...
computing gzip size...
[2mdist/[22m[32mindex.html                                  [39m[1m[2m  4.17 kB[22m[1m[22m[2m │ gzip:   1.26 kB[22m
[2mdist/[22m[2massets/[22m[32mno-keys-BGMicyfS.png                 [39m[1m[2m 32.38 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[32mno-team-D1Jh2WgI.png                 [39m[1m[2m 34.39 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[32mno-guides-Cb7arpBn.png               [39m[1m[2m 43.31 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[32mappliances-Byu61byn.jpg              [39m[1m[2m118.05 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[32mdriveway-access-BKpyvMbc.jpg         [39m[1m[2m129.07 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[32mpile-closeup-IrL4MiY5.jpg            [39m[1m[2m130.61 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[32mwide-garage-CXfvQLmS.jpg             [39m[1m[2m131.52 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[35mindex-SNPfD3ue.css                   [39m[1m[2m144.27 kB[22m[1m[22m[2m │ gzip:  24.41 kB[22m
[2mdist/[22m[2massets/[22m[36mindex-DV4xWWly.js                    [39m[1m[2m  0.28 kB[22m[1m[22m[2m │ gzip:   0.20 kB[22m[2m │ map:     0.93 kB[22m
[2mdist/[22m[2massets/[22m[36mformat-CfHXEHKo.js                   [39m[1m[2m  0.31 kB[22m[1m[22m[2m │ gzip:   0.24 kB[22m[2m │ map:     1.19 kB[22m
[2mdist/[22m[2massets/[22m[36mPlanTag-DOOEtZY_.js                  [39m[1m[2m  0.37 kB[22m[1m[22m[2m │ gzip:   0.30 kB[22m[2m │ map:     1.28 kB[22m
[2mdist/[22m[2massets/[22m[36museGuides-BxNGPWd5.js                [39m[1m[2m  0.38 kB[22m[1m[22m[2m │ gzip:   0.27 kB[22m[2m │ map:     2.51 kB[22m
[2mdist/[22m[2massets/[22m[36mpdfService-BmlLp5k8.js               [39m[1m[2m  0.38 kB[22m[1m[22m[2m │ gzip:   0.28 kB[22m[2m │ map:     1.19 kB[22m
[2mdist/[22m[2massets/[22m[36msearch-CcRJnrZB.js                   [39m[1m[2m  0.39 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m[2m │ map:     0.88 kB[22m
[2mdist/[22m[2massets/[22m[36mclock-HMmMF9NB.js                    [39m[1m[2m  0.40 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m[2m │ map:     0.89 kB[22m
[2mdist/[22m[2massets/[22m[36museRequests-CdEM5oM4.js              [39m[1m[2m  0.41 kB[22m[1m[22m[2m │ gzip:   0.29 kB[22m[2m │ map:     1.82 kB[22m
[2mdist/[22m[2massets/[22m[36mcopy-pHHEjaJH.js                     [39m[1m[2m  0.45 kB[22m[1m[22m[2m │ gzip:   0.34 kB[22m[2m │ map:     0.97 kB[22m
[2mdist/[22m[2massets/[22m[36meye-Ch2FrIBM.js                      [39m[1m[2m  0.47 kB[22m[1m[22m[2m │ gzip:   0.34 kB[22m[2m │ map:     0.98 kB[22m
[2mdist/[22m[2massets/[22m[36marchive-rh_OeS0Q.js                  [39m[1m[2m  0.47 kB[22m[1m[22m[2m │ gzip:   0.34 kB[22m[2m │ map:     1.06 kB[22m
[2mdist/[22m[2massets/[22m[36mexternal-link-UAwM4zX3.js            [39m[1m[2m  0.47 kB[22m[1m[22m[2m │ gzip:   0.34 kB[22m[2m │ map:     1.04 kB[22m
[2mdist/[22m[2massets/[22m[36mclipboard-BqEy4CRk.js                [39m[1m[2m  0.47 kB[22m[1m[22m[2m │ gzip:   0.34 kB[22m[2m │ map:     1.06 kB[22m
[2mdist/[22m[2massets/[22m[36mpencil-ChuiVhKv.js                   [39m[1m[2m  0.49 kB[22m[1m[22m[2m │ gzip:   0.36 kB[22m[2m │ map:     0.99 kB[22m
[2mdist/[22m[2massets/[22m[36mlightbulb-B-TNW6rZ.js                [39m[1m[2m  0.50 kB[22m[1m[22m[2m │ gzip:   0.36 kB[22m[2m │ map:     1.08 kB[22m
[2mdist/[22m[2massets/[22m[36mlayout-template-VvE1xGFS.js          [39m[1m[2m  0.51 kB[22m[1m[22m[2m │ gzip:   0.33 kB[22m[2m │ map:     1.25 kB[22m
[2mdist/[22m[2massets/[22m[36muser-plus-CFrLTvce.js                [39m[1m[2m  0.53 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m[2m │ map:     1.24 kB[22m
[2mdist/[22m[2massets/[22m[36mplug-zap-x_4no3xf.js                 [39m[1m[2m  0.57 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m[2m │ map:     1.25 kB[22m
[2mdist/[22m[2massets/[22m[36mtrash-2-BGJjNOP4.js                  [39m[1m[2m  0.57 kB[22m[1m[22m[2m │ gzip:   0.39 kB[22m[2m │ map:     1.32 kB[22m
[2mdist/[22m[2massets/[22m[36mReadinessScoreBadge-CIUjG3sM.js      [39m[1m[2m  0.58 kB[22m[1m[22m[2m │ gzip:   0.36 kB[22m[2m │ map:     1.35 kB[22m
[2mdist/[22m[2massets/[22m[36mphone-MiWz9FI6.js                    [39m[1m[2m  0.61 kB[22m[1m[22m[2m │ gzip:   0.39 kB[22m[2m │ map:     1.04 kB[22m
[2mdist/[22m[2massets/[22m[36mbuilding-2-C6M_lryE.js               [39m[1m[2m  0.66 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m[2m │ map:     1.46 kB[22m
[2mdist/[22m[2massets/[22m[36mstatusOptions-3W9GPB6v.js            [39m[1m[2m  0.68 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m[2m │ map:     1.95 kB[22m
[2mdist/[22m[2massets/[22m[36mPageHeader-yZ79u8bJ.js               [39m[1m[2m  0.70 kB[22m[1m[22m[2m │ gzip:   0.41 kB[22m[2m │ map:     2.20 kB[22m
[2mdist/[22m[2massets/[22m[36mbadge-CMVl63FU.js                    [39m[1m[2m  0.75 kB[22m[1m[22m[2m │ gzip:   0.41 kB[22m[2m │ map:     1.65 kB[22m
[2mdist/[22m[2massets/[22m[36mwrench-C3Nl-QMZ.js                   [39m[1m[2m  0.79 kB[22m[1m[22m[2m │ gzip:   0.43 kB[22m[2m │ map:     1.74 kB[22m
[2mdist/[22m[2massets/[22m[36mStatusBadge-CzL7fECt.js              [39m[1m[2m  0.95 kB[22m[1m[22m[2m │ gzip:   0.47 kB[22m[2m │ map:     2.31 kB[22m
[2mdist/[22m[2massets/[22m[36mmessagingService-CGVssquS.js         [39m[1m[2m  1.47 kB[22m[1m[22m[2m │ gzip:   0.69 kB[22m[2m │ map:     5.34 kB[22m
[2mdist/[22m[2massets/[22m[36mEmptyState-CqS0FC6Q.js               [39m[1m[2m  1.51 kB[22m[1m[22m[2m │ gzip:   0.75 kB[22m[2m │ map:     4.98 kB[22m
[2mdist/[22m[2massets/[22m[36mAcceptInvitePage-DWNYJtgh.js         [39m[1m[2m  1.59 kB[22m[1m[22m[2m │ gzip:   0.82 kB[22m[2m │ map:     3.96 kB[22m
[2mdist/[22m[2massets/[22m[36mteamService-vcMtx2Uq.js              [39m[1m[2m  1.65 kB[22m[1m[22m[2m │ gzip:   0.73 kB[22m[2m │ map:     5.82 kB[22m
[2mdist/[22m[2massets/[22m[36msmsConfigService-DTDUBYwn.js         [39m[1m[2m  1.74 kB[22m[1m[22m[2m │ gzip:   0.70 kB[22m[2m │ map:     5.76 kB[22m
[2mdist/[22m[2massets/[22m[36mswitch-CODUoPvr.js                   [39m[1m[2m  2.53 kB[22m[1m[22m[2m │ gzip:   1.28 kB[22m[2m │ map:     9.86 kB[22m
[2mdist/[22m[2massets/[22m[36museUsage-z8R4mk8l.js                 [39m[1m[2m  2.56 kB[22m[1m[22m[2m │ gzip:   0.99 kB[22m[2m │ map:     9.81 kB[22m
[2mdist/[22m[2massets/[22m[36museMutation-D2Kax--F.js              [39m[1m[2m  2.93 kB[22m[1m[22m[2m │ gzip:   1.25 kB[22m[2m │ map:     8.41 kB[22m
[2mdist/[22m[2massets/[22m[36mrequestsService-D9bcOptk.js          [39m[1m[2m  3.42 kB[22m[1m[22m[2m │ gzip:   1.10 kB[22m[2m │ map:    10.55 kB[22m
[2mdist/[22m[2massets/[22m[36museTeamMembers-BwFFWF1Q.js           [39m[1m[2m  4.54 kB[22m[1m[22m[2m │ gzip:   2.05 kB[22m[2m │ map:    18.18 kB[22m
[2mdist/[22m[2massets/[22m[36mCustomersPage-BgmjztrS.js            [39m[1m[2m  4.86 kB[22m[1m[22m[2m │ gzip:   1.88 kB[22m[2m │ map:    12.75 kB[22m
[2mdist/[22m[2massets/[22m[36mMessageTemplatesPage-CVEKd9uk.js     [39m[1m[2m  5.40 kB[22m[1m[22m[2m │ gzip:   2.11 kB[22m[2m │ map:    16.05 kB[22m
[2mdist/[22m[2massets/[22m[36mGuideBuilderPage-CoNWjvo5.js         [39m[1m[2m  5.47 kB[22m[1m[22m[2m │ gzip:   2.18 kB[22m[2m │ map:    13.35 kB[22m
[2mdist/[22m[2massets/[22m[36mGuideLibraryPage-DLOWp2n0.js         [39m[1m[2m  7.12 kB[22m[1m[22m[2m │ gzip:   2.33 kB[22m[2m │ map:    15.63 kB[22m
[2mdist/[22m[2massets/[22m[36mCustomerDetailPage-xJlfMdq_.js       [39m[1m[2m  8.08 kB[22m[1m[22m[2m │ gzip:   2.85 kB[22m[2m │ map:    19.24 kB[22m
[2mdist/[22m[2massets/[22m[36mGeneratedQuestionEditor-CV2JcnJj.js  [39m[1m[2m  8.47 kB[22m[1m[22m[2m │ gzip:   2.71 kB[22m[2m │ map:    25.14 kB[22m
[2mdist/[22m[2massets/[22m[36mCustomerFormDialog-8VQ93S5v.js       [39m[1m[2m  8.81 kB[22m[1m[22m[2m │ gzip:   2.94 kB[22m[2m │ map:    25.99 kB[22m
[2mdist/[22m[2massets/[22m[36mAdminAIRerun-ccz7JZJt.js             [39m[1m[2m  9.65 kB[22m[1m[22m[2m │ gzip:   3.20 kB[22m[2m │ map:    26.20 kB[22m
[2mdist/[22m[2massets/[22m[36mGuideDetailPage-BqVVk1-j.js          [39m[1m[2m 10.69 kB[22m[1m[22m[2m │ gzip:   3.64 kB[22m[2m │ map:    35.43 kB[22m
[2mdist/[22m[2massets/[22m[36mBrandSettingsPage-DfEHV7HI.js        [39m[1m[2m 11.38 kB[22m[1m[22m[2m │ gzip:   3.59 kB[22m[2m │ map:    29.06 kB[22m
[2mdist/[22m[2massets/[22m[36mAdminInvites-DJiVrJdc.js             [39m[1m[2m 11.83 kB[22m[1m[22m[2m │ gzip:   3.61 kB[22m[2m │ map:    36.83 kB[22m
[2mdist/[22m[2massets/[22m[36mRequestDetailPage-CjWKyPjn.js        [39m[1m[2m 11.94 kB[22m[1m[22m[2m │ gzip:   4.63 kB[22m[2m │ map:    34.22 kB[22m
[2mdist/[22m[2massets/[22m[36mSmsSettingsPage-CaS7XmTz.js          [39m[1m[2m 12.94 kB[22m[1m[22m[2m │ gzip:   4.24 kB[22m[2m │ map:    37.13 kB[22m
[2mdist/[22m[2massets/[22m[36mRequestsInboxPage-yg4GS5nz.js        [39m[1m[2m 16.04 kB[22m[1m[22m[2m │ gzip:   4.68 kB[22m[2m │ map:    48.88 kB[22m
[2mdist/[22m[2massets/[22m[36mTeamSettingsPage-9Dpb_-AK.js         [39m[1m[2m 17.87 kB[22m[1m[22m[2m │ gzip:   5.58 kB[22m[2m │ map:    50.84 kB[22m
[2mdist/[22m[2massets/[22m[36mDashboardPage-ByukDXvt.js            [39m[1m[2m 18.16 kB[22m[1m[22m[2m │ gzip:   5.76 kB[22m[2m │ map:    46.10 kB[22m
[2mdist/[22m[2massets/[22m[36mOnboardingPage-C3N6Yk8X.js           [39m[1m[2m 18.62 kB[22m[1m[22m[2m │ gzip:   4.97 kB[22m[2m │ map:    47.71 kB[22m
[2mdist/[22m[2massets/[22m[36mselect-UcJairS-.js                   [39m[1m[2m 21.37 kB[22m[1m[22m[2m │ gzip:   7.55 kB[22m[2m │ map:    90.62 kB[22m
[2mdist/[22m[2massets/[22m[36mCreateRequestPage-CydRuI8t.js        [39m[1m[2m 21.97 kB[22m[1m[22m[2m │ gzip:   6.86 kB[22m[2m │ map:    53.16 kB[22m
[2mdist/[22m[2massets/[22m[36mWebsiteIntakePage-CY_Mc2O1.js        [39m[1m[2m 26.66 kB[22m[1m[22m[2m │ gzip:   7.44 kB[22m[2m │ map:    66.73 kB[22m
[2mdist/[22m[2massets/[22m[36mBillingSettingsPage-DQP9L9Gs.js      [39m[1m[2m 31.43 kB[22m[1m[22m[2m │ gzip:  10.83 kB[22m[2m │ map:   118.20 kB[22m
[2mdist/[22m[2massets/[22m[36mIntegrationsPage-dFMD8x8Q.js         [39m[1m[2m 34.11 kB[22m[1m[22m[2m │ gzip:  10.06 kB[22m[2m │ map:    76.81 kB[22m
[2mdist/[22m[2massets/[22m[36mBetaGuidePage-D9HmcEC1.js            [39m[1m[2m 40.52 kB[22m[1m[22m[2m │ gzip:  11.63 kB[22m[2m │ map:    75.83 kB[22m
[2mdist/[22m[2massets/[22m[36mSubmissionReviewPage-BUe11zB7.js     [39m[1m[2m 50.16 kB[22m[1m[22m[2m │ gzip:  14.01 kB[22m[2m │ map:   146.62 kB[22m
[2mdist/[22m[2massets/[22m[36mtypes-CZyzcKJF.js                    [39m[1m[2m 53.46 kB[22m[1m[22m[2m │ gzip:  12.23 kB[22m[2m │ map:   223.44 kB[22m
[2mdist/[22m[2massets/[22m[36mindex-Df8do4g6.js                    [39m[1m[33m930.10 kB[39m[22m[2m │ gzip: 267.61 kB[22m[2m │ map: 3,586.29 kB[22m
[33m
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.[39m
[32m✓ built in 8.03s[39m
```

## Summary
npm-ci=0
typecheck=0
lint=0
build=0
