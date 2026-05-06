# Routing refactor final CI

Commit: 70a9d4c106914510708b9172d5dff44a30f4f0ac
Run started: 2026-05-06T11:07:32Z

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
  91:18  warning  Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components  react-refresh/only-export-components

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

/home/runner/work/photo-brief/photo-brief/src/features/support/pages/SupportPage.tsx
  53:6  warning  React Hook useEffect has a missing dependency: 'load'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

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

/home/runner/work/photo-brief/photo-brief/src/pages/BetaList.tsx
  145:6  warning  React Hook useEffect has a missing dependency: 'utm'. Either include it or remove the dependency array  react-hooks/exhaustive-deps

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

/home/runner/work/photo-brief/photo-brief/supabase/functions/_shared/transactional-email-templates/business-request-ready.tsx
  19:7  warning  Fast refresh only works when a file only exports components. Move your component(s) to a separate file  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/supabase/functions/_shared/transactional-email-templates/customer-submission-confirmation.tsx
  15:7  warning  Fast refresh only works when a file only exports components. Move your component(s) to a separate file  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/supabase/functions/_shared/transactional-email-templates/founding-partner-welcome.tsx
  14:7  warning  Fast refresh only works when a file only exports components. Move your component(s) to a separate file  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/supabase/functions/_shared/transactional-email-templates/recipient-reminder.tsx
  16:7  warning  Fast refresh only works when a file only exports components. Move your component(s) to a separate file  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/supabase/functions/_shared/transactional-email-templates/recipient-request-link.tsx
  18:7  warning  Fast refresh only works when a file only exports components. Move your component(s) to a separate file  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/supabase/functions/_shared/transactional-email-templates/submission-received.tsx
  19:7  warning  Fast refresh only works when a file only exports components. Move your component(s) to a separate file  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/supabase/functions/_shared/transactional-email-templates/waitlist-admin-notification.tsx
  22:7  warning  Fast refresh only works when a file only exports components. Move your component(s) to a separate file  react-refresh/only-export-components
  30:7  warning  Fast refresh only works when a file only exports components. Move your component(s) to a separate file  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/supabase/functions/_shared/transactional-email-templates/waitlist-confirmation.tsx
  11:7  warning  Fast refresh only works when a file only exports components. Move your component(s) to a separate file  react-refresh/only-export-components

/home/runner/work/photo-brief/photo-brief/supabase/functions/_shared/transactional-email-templates/workspace-welcome.tsx
  14:7  warning  Fast refresh only works when a file only exports components. Move your component(s) to a separate file  react-refresh/only-export-components

✖ 47 problems (0 errors, 47 warnings)
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
[32m✓[39m 2311 modules transformed.
rendering chunks...
computing gzip size...
[2mdist/[22m[32mindex.html                                  [39m[1m[2m  4.10 kB[22m[1m[22m[2m │ gzip:   1.23 kB[22m
[2mdist/[22m[2massets/[22m[32mno-keys-BGMicyfS.png                 [39m[1m[2m 32.38 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[32mno-team-D1Jh2WgI.png                 [39m[1m[2m 34.39 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[32mno-guides-Cb7arpBn.png               [39m[1m[2m 43.31 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[32mappliances-Byu61byn.jpg              [39m[1m[2m118.05 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[32mdriveway-access-BKpyvMbc.jpg         [39m[1m[2m129.07 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[32mpile-closeup-IrL4MiY5.jpg            [39m[1m[2m130.61 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[32mwide-garage-CXfvQLmS.jpg             [39m[1m[2m131.52 kB[22m[1m[22m
[2mdist/[22m[2massets/[22m[35mindex-zbP1fbDd.css                   [39m[1m[2m152.36 kB[22m[1m[22m[2m │ gzip:  25.71 kB[22m
[2mdist/[22m[2massets/[22m[36mindex-CWGtRbGm.js                    [39m[1m[2m  0.28 kB[22m[1m[22m[2m │ gzip:   0.21 kB[22m[2m │ map:     0.93 kB[22m
[2mdist/[22m[2massets/[22m[36mformat-CfHXEHKo.js                   [39m[1m[2m  0.31 kB[22m[1m[22m[2m │ gzip:   0.24 kB[22m[2m │ map:     1.19 kB[22m
[2mdist/[22m[2massets/[22m[36mPlanTag-BZNPIBRB.js                  [39m[1m[2m  0.37 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m[2m │ map:     1.28 kB[22m
[2mdist/[22m[2massets/[22m[36museGuides-Df_wonC_.js                [39m[1m[2m  0.38 kB[22m[1m[22m[2m │ gzip:   0.27 kB[22m[2m │ map:     2.51 kB[22m
[2mdist/[22m[2massets/[22m[36mpdfService-CY9Gf0SW.js               [39m[1m[2m  0.38 kB[22m[1m[22m[2m │ gzip:   0.29 kB[22m[2m │ map:     1.19 kB[22m
[2mdist/[22m[2massets/[22m[36msearch-LGOsx0cJ.js                   [39m[1m[2m  0.39 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m[2m │ map:     0.88 kB[22m
[2mdist/[22m[2massets/[22m[36museRequests-CYcn_in_.js              [39m[1m[2m  0.41 kB[22m[1m[22m[2m │ gzip:   0.29 kB[22m[2m │ map:     1.82 kB[22m
[2mdist/[22m[2massets/[22m[36mReadinessProgress-ClsV1Nbx.js        [39m[1m[2m  0.43 kB[22m[1m[22m[2m │ gzip:   0.33 kB[22m[2m │ map:     1.17 kB[22m
[2mdist/[22m[2massets/[22m[36mcopy-Bm6_QKVA.js                     [39m[1m[2m  0.45 kB[22m[1m[22m[2m │ gzip:   0.34 kB[22m[2m │ map:     0.97 kB[22m
[2mdist/[22m[2massets/[22m[36meye-KU-XcxYk.js                      [39m[1m[2m  0.47 kB[22m[1m[22m[2m │ gzip:   0.34 kB[22m[2m │ map:     0.98 kB[22m
[2mdist/[22m[2massets/[22m[36marchive-BufzzoyU.js                  [39m[1m[2m  0.47 kB[22m[1m[22m[2m │ gzip:   0.35 kB[22m[2m │ map:     1.06 kB[22m
[2mdist/[22m[2massets/[22m[36mexternal-link--8Xe1ztw.js            [39m[1m[2m  0.47 kB[22m[1m[22m[2m │ gzip:   0.34 kB[22m[2m │ map:     1.04 kB[22m
[2mdist/[22m[2massets/[22m[36mclipboard-RIfY7frc.js                [39m[1m[2m  0.47 kB[22m[1m[22m[2m │ gzip:   0.35 kB[22m[2m │ map:     1.06 kB[22m
[2mdist/[22m[2massets/[22m[36mpencil-BGvoSd4v.js                   [39m[1m[2m  0.49 kB[22m[1m[22m[2m │ gzip:   0.36 kB[22m[2m │ map:     0.99 kB[22m
[2mdist/[22m[2massets/[22m[36muser-plus-Da4RlyIy.js                [39m[1m[2m  0.53 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m[2m │ map:     1.24 kB[22m
[2mdist/[22m[2massets/[22m[36mplug-zap-lIi4RI8Z.js                 [39m[1m[2m  0.57 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m[2m │ map:     1.25 kB[22m
[2mdist/[22m[2massets/[22m[36mtrash-2-BAbF1pyW.js                  [39m[1m[2m  0.57 kB[22m[1m[22m[2m │ gzip:   0.39 kB[22m[2m │ map:     1.32 kB[22m
[2mdist/[22m[2massets/[22m[36mReadinessScoreBadge-Csd6WB0s.js      [39m[1m[2m  0.58 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m[2m │ map:     1.35 kB[22m
[2mdist/[22m[2massets/[22m[36mphone-BZgWUkOV.js                    [39m[1m[2m  0.61 kB[22m[1m[22m[2m │ gzip:   0.40 kB[22m[2m │ map:     1.04 kB[22m
[2mdist/[22m[2massets/[22m[36mbuilding-2-BnFaFGeF.js               [39m[1m[2m  0.66 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m[2m │ map:     1.46 kB[22m
[2mdist/[22m[2massets/[22m[36mrocket-B-HNvevQ.js                   [39m[1m[2m  0.67 kB[22m[1m[22m[2m │ gzip:   0.45 kB[22m[2m │ map:     1.34 kB[22m
[2mdist/[22m[2massets/[22m[36mstatusOptions-3W9GPB6v.js            [39m[1m[2m  0.68 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m[2m │ map:     1.95 kB[22m
[2mdist/[22m[2massets/[22m[36mstar-DhiHU_uD.js                     [39m[1m[2m  0.68 kB[22m[1m[22m[2m │ gzip:   0.44 kB[22m[2m │ map:     1.12 kB[22m
[2mdist/[22m[2massets/[22m[36mbadge-IXHqcoRk.js                    [39m[1m[2m  0.75 kB[22m[1m[22m[2m │ gzip:   0.41 kB[22m[2m │ map:     1.65 kB[22m
[2mdist/[22m[2massets/[22m[36mwrench-a1cuEXvF.js                   [39m[1m[2m  0.79 kB[22m[1m[22m[2m │ gzip:   0.43 kB[22m[2m │ map:     1.74 kB[22m
[2mdist/[22m[2massets/[22m[36mStatusBadge-CTH_9xCT.js              [39m[1m[2m  0.95 kB[22m[1m[22m[2m │ gzip:   0.48 kB[22m[2m │ map:     2.31 kB[22m
[2mdist/[22m[2massets/[22m[36mPageHeader-6Do8ZKoz.js               [39m[1m[2m  0.95 kB[22m[1m[22m[2m │ gzip:   0.52 kB[22m[2m │ map:     2.65 kB[22m
[2mdist/[22m[2massets/[22m[36mwand-sparkles-BOx2udyb.js            [39m[1m[2m  1.26 kB[22m[1m[22m[2m │ gzip:   0.60 kB[22m[2m │ map:     2.89 kB[22m
[2mdist/[22m[2massets/[22m[36mmessagingService-DtcP_kmg.js         [39m[1m[2m  1.47 kB[22m[1m[22m[2m │ gzip:   0.69 kB[22m[2m │ map:     5.34 kB[22m
[2mdist/[22m[2massets/[22m[36mEmptyState-DMhp8-Xs.js               [39m[1m[2m  1.51 kB[22m[1m[22m[2m │ gzip:   0.75 kB[22m[2m │ map:     4.98 kB[22m
[2mdist/[22m[2massets/[22m[36mteamService-Cvy8LtOM.js              [39m[1m[2m  1.65 kB[22m[1m[22m[2m │ gzip:   0.73 kB[22m[2m │ map:     5.82 kB[22m
[2mdist/[22m[2massets/[22m[36msmsConfigService-BR46wzk5.js         [39m[1m[2m  1.74 kB[22m[1m[22m[2m │ gzip:   0.71 kB[22m[2m │ map:     5.76 kB[22m
[2mdist/[22m[2massets/[22m[36mAcceptInvitePage-NpwriJKe.js         [39m[1m[2m  1.99 kB[22m[1m[22m[2m │ gzip:   1.05 kB[22m[2m │ map:     4.91 kB[22m
[2mdist/[22m[2massets/[22m[36mTicketThread-tkq2FTPv.js             [39m[1m[2m  2.05 kB[22m[1m[22m[2m │ gzip:   1.15 kB[22m[2m │ map:     6.37 kB[22m
[2mdist/[22m[2massets/[22m[36mswitch--7XJWPYt.js                   [39m[1m[2m  2.53 kB[22m[1m[22m[2m │ gzip:   1.28 kB[22m[2m │ map:     9.86 kB[22m
[2mdist/[22m[2massets/[22m[36museUsage-CkOFbvIk.js                 [39m[1m[2m  2.56 kB[22m[1m[22m[2m │ gzip:   0.99 kB[22m[2m │ map:     9.81 kB[22m
[2mdist/[22m[2massets/[22m[36museMutation-Be1Ljexp.js              [39m[1m[2m  2.93 kB[22m[1m[22m[2m │ gzip:   1.25 kB[22m[2m │ map:     8.41 kB[22m
[2mdist/[22m[2massets/[22m[36mrequestsService-CrlYei6W.js          [39m[1m[2m  3.42 kB[22m[1m[22m[2m │ gzip:   1.11 kB[22m[2m │ map:    10.55 kB[22m
[2mdist/[22m[2massets/[22m[36mSupportPage-8-jAoEdY.js              [39m[1m[2m  4.47 kB[22m[1m[22m[2m │ gzip:   1.78 kB[22m[2m │ map:    12.60 kB[22m
[2mdist/[22m[2massets/[22m[36museTeamMembers-O38q7qEz.js           [39m[1m[2m  4.54 kB[22m[1m[22m[2m │ gzip:   2.06 kB[22m[2m │ map:    18.18 kB[22m
[2mdist/[22m[2massets/[22m[36mCustomersPage-BIO1MgH4.js            [39m[1m[2m  4.86 kB[22m[1m[22m[2m │ gzip:   1.88 kB[22m[2m │ map:    12.75 kB[22m
[2mdist/[22m[2massets/[22m[36mMessageTemplatesPage-DLezSwZN.js     [39m[1m[2m  5.46 kB[22m[1m[22m[2m │ gzip:   2.15 kB[22m[2m │ map:    16.18 kB[22m
[2mdist/[22m[2massets/[22m[36mGuideBuilderPage-WlZ5SsAE.js         [39m[1m[2m  5.86 kB[22m[1m[22m[2m │ gzip:   2.29 kB[22m[2m │ map:    14.23 kB[22m
[2mdist/[22m[2massets/[22m[36mGuideLibraryPage-daWOJhdJ.js         [39m[1m[2m  6.99 kB[22m[1m[22m[2m │ gzip:   2.30 kB[22m[2m │ map:    15.52 kB[22m
[2mdist/[22m[2massets/[22m[36mCustomerDetailPage-CaMLqWJX.js       [39m[1m[2m  8.08 kB[22m[1m[22m[2m │ gzip:   2.86 kB[22m[2m │ map:    19.24 kB[22m
[2mdist/[22m[2massets/[22m[36mGeneratedQuestionEditor-6KNGJE74.js  [39m[1m[2m  8.47 kB[22m[1m[22m[2m │ gzip:   2.71 kB[22m[2m │ map:    25.14 kB[22m
[2mdist/[22m[2massets/[22m[36mCustomerFormDialog-B9lCZsR6.js       [39m[1m[2m  8.81 kB[22m[1m[22m[2m │ gzip:   2.94 kB[22m[2m │ map:    25.99 kB[22m
[2mdist/[22m[2massets/[22m[36mAdminAIRerun-s4SzgLom.js             [39m[1m[2m  9.65 kB[22m[1m[22m[2m │ gzip:   3.20 kB[22m[2m │ map:    26.20 kB[22m
[2mdist/[22m[2massets/[22m[36mAdminCommandCenter-BwdaSSzq.js       [39m[1m[2m  9.78 kB[22m[1m[22m[2m │ gzip:   3.05 kB[22m[2m │ map:    30.01 kB[22m
[2mdist/[22m[2massets/[22m[36mGuideDetailPage-C5Iusmsa.js          [39m[1m[2m 10.73 kB[22m[1m[22m[2m │ gzip:   3.66 kB[22m[2m │ map:    35.53 kB[22m
[2mdist/[22m[2massets/[22m[36mBrandSettingsPage-CREZqo4e.js        [39m[1m[2m 11.44 kB[22m[1m[22m[2m │ gzip:   3.63 kB[22m[2m │ map:    29.19 kB[22m
[2mdist/[22m[2massets/[22m[36mAdminInvites-DbMc_tFX.js             [39m[1m[2m 11.83 kB[22m[1m[22m[2m │ gzip:   3.62 kB[22m[2m │ map:    36.83 kB[22m
[2mdist/[22m[2massets/[22m[36mRequestDetailPage-cQi3jPqn.js        [39m[1m[2m 11.99 kB[22m[1m[22m[2m │ gzip:   4.65 kB[22m[2m │ map:    34.32 kB[22m
[2mdist/[22m[2massets/[22m[36mSmsSettingsPage-DmpTVt5g.js          [39m[1m[2m 12.38 kB[22m[1m[22m[2m │ gzip:   3.93 kB[22m[2m │ map:    31.54 kB[22m
[2mdist/[22m[2massets/[22m[36mRequestsInboxPage-C0ae4FbL.js        [39m[1m[2m 16.09 kB[22m[1m[22m[2m │ gzip:   4.70 kB[22m[2m │ map:    48.96 kB[22m
[2mdist/[22m[2massets/[22m[36mBetaWelcome-DlKwkZT-.js              [39m[1m[2m 17.89 kB[22m[1m[22m[2m │ gzip:   5.36 kB[22m[2m │ map:    38.19 kB[22m
[2mdist/[22m[2massets/[22m[36mTeamSettingsPage-Dp3ZKHSk.js         [39m[1m[2m 17.93 kB[22m[1m[22m[2m │ gzip:   5.62 kB[22m[2m │ map:    50.97 kB[22m
[2mdist/[22m[2massets/[22m[36mDashboardPage-DFQqAzqG.js            [39m[1m[2m 18.53 kB[22m[1m[22m[2m │ gzip:   6.03 kB[22m[2m │ map:    46.61 kB[22m
[2mdist/[22m[2massets/[22m[36mOnboardingPage-5NhMHcfo.js           [39m[1m[2m 18.62 kB[22m[1m[22m[2m │ gzip:   4.98 kB[22m[2m │ map:    47.71 kB[22m
[2mdist/[22m[2massets/[22m[36mselect-DSgGHnoj.js                   [39m[1m[2m 21.37 kB[22m[1m[22m[2m │ gzip:   7.55 kB[22m[2m │ map:    90.62 kB[22m
[2mdist/[22m[2massets/[22m[36mBetaPortfolio-BJqtC0FQ.js            [39m[1m[2m 23.91 kB[22m[1m[22m[2m │ gzip:   6.49 kB[22m[2m │ map:    43.61 kB[22m
[2mdist/[22m[2massets/[22m[36mWebsiteIntakePage-H7cGbO7A.js        [39m[1m[2m 26.70 kB[22m[1m[22m[2m │ gzip:   7.47 kB[22m[2m │ map:    66.73 kB[22m
[2mdist/[22m[2massets/[22m[36mCreateRequestPage-COK_BwnL.js        [39m[1m[2m 27.31 kB[22m[1m[22m[2m │ gzip:   8.23 kB[22m[2m │ map:    74.03 kB[22m
[2mdist/[22m[2massets/[22m[36mBillingSettingsPage-mtiKGvxD.js      [39m[1m[2m 31.41 kB[22m[1m[22m[2m │ gzip:  10.86 kB[22m[2m │ map:   118.19 kB[22m
[2mdist/[22m[2massets/[22m[36mBetaGuidePage-D1pn996c.js            [39m[1m[2m 39.96 kB[22m[1m[22m[2m │ gzip:  11.29 kB[22m[2m │ map:    74.61 kB[22m
[2mdist/[22m[2massets/[22m[36mIntegrationsPage-CmEt8Adm.js         [39m[1m[2m 49.51 kB[22m[1m[22m[2m │ gzip:  14.55 kB[22m[2m │ map:    98.36 kB[22m
[2mdist/[22m[2massets/[22m[36mSubmissionReviewPage-CeOc4Ilx.js     [39m[1m[2m 50.17 kB[22m[1m[22m[2m │ gzip:  14.02 kB[22m[2m │ map:   146.62 kB[22m
[2mdist/[22m[2massets/[22m[36mtypes-CZyzcKJF.js                    [39m[1m[2m 53.46 kB[22m[1m[22m[2m │ gzip:  12.23 kB[22m[2m │ map:   223.44 kB[22m
[2mdist/[22m[2massets/[22m[36mindex-q5PFJ4N9.js                    [39m[1m[33m915.24 kB[39m[22m[2m │ gzip: 264.20 kB[22m[2m │ map: 3,568.83 kB[22m
[33m
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.[39m
[32m✓ built in 8.51s[39m
```

## Summary
npm-ci=0
typecheck=0
lint=0
build=0
