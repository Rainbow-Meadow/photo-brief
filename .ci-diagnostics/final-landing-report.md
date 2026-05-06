# Final landing CI

Commit: 4a728b5f0569ab74d00cf4d291c9c86e43e5b077
Run started: 2026-05-05T03:51:09Z

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
[2mdist/[22m[2massets/[22m[35mindex-CjmmzOeA.css                   [39m[1m[2m143.77 kB[22m[1m[22m[2m │ gzip:  24.35 kB[22m
[2mdist/[22m[2massets/[22m[36mindex-_KXuuciU.js                    [39m[1m[2m  0.28 kB[22m[1m[22m[2m │ gzip:   0.21 kB[22m[2m │ map:     0.93 kB[22m
[2mdist/[22m[2massets/[22m[36mformat-CfHXEHKo.js                   [39m[1m[2m  0.31 kB[22m[1m[22m[2m │ gzip:   0.24 kB[22m[2m │ map:     1.19 kB[22m
[2mdist/[22m[2massets/[22m[36mPlanTag-D6HqV7xz.js                  [39m[1m[2m  0.37 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m[2m │ map:     1.28 kB[22m
[2mdist/[22m[2massets/[22m[36museGuides-BmJOjWxv.js                [39m[1m[2m  0.38 kB[22m[1m[22m[2m │ gzip:   0.27 kB[22m[2m │ map:     2.51 kB[22m
[2mdist/[22m[2massets/[22m[36mpdfService-Bg8KUwA4.js               [39m[1m[2m  0.38 kB[22m[1m[22m[2m │ gzip:   0.28 kB[22m[2m │ map:     1.19 kB[22m
[2mdist/[22m[2massets/[22m[36msearch-CURGhujr.js                   [39m[1m[2m  0.39 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m[2m │ map:     0.88 kB[22m
[2mdist/[22m[2massets/[22m[36mclock-CyXR67vD.js                    [39m[1m[2m  0.40 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m[2m │ map:     0.89 kB[22m
[2mdist/[22m[2massets/[22m[36museRequests-CM5P_u9Q.js              [39m[1m[2m  0.41 kB[22m[1m[22m[2m │ gzip:   0.29 kB[22m[2m │ map:     1.82 kB[22m
[2mdist/[22m[2massets/[22m[36mcopy-CxFgHNHv.js                     [39m[1m[2m  0.45 kB[22m[1m[22m[2m │ gzip:   0.34 kB[22m[2m │ map:     0.97 kB[22m
[2mdist/[22m[2massets/[22m[36meye-D5VVrlqz.js                      [39m[1m[2m  0.47 kB[22m[1m[22m[2m │ gzip:   0.34 kB[22m[2m │ map:     0.98 kB[22m
[2mdist/[22m[2massets/[22m[36marchive-C5ikgLR3.js                  [39m[1m[2m  0.47 kB[22m[1m[22m[2m │ gzip:   0.35 kB[22m[2m │ map:     1.06 kB[22m
[2mdist/[22m[2massets/[22m[36mexternal-link-DRRtbQ0g.js            [39m[1m[2m  0.47 kB[22m[1m[22m[2m │ gzip:   0.34 kB[22m[2m │ map:     1.04 kB[22m
[2mdist/[22m[2massets/[22m[36mclipboard-D0sgabMH.js                [39m[1m[2m  0.47 kB[22m[1m[22m[2m │ gzip:   0.34 kB[22m[2m │ map:     1.06 kB[22m
[2mdist/[22m[2massets/[22m[36mpencil-Chr6tMfU.js                   [39m[1m[2m  0.49 kB[22m[1m[22m[2m │ gzip:   0.36 kB[22m[2m │ map:     0.99 kB[22m
[2mdist/[22m[2massets/[22m[36mlightbulb-BeZ1Ns3h.js                [39m[1m[2m  0.50 kB[22m[1m[22m[2m │ gzip:   0.36 kB[22m[2m │ map:     1.08 kB[22m
[2mdist/[22m[2massets/[22m[36mlayout-template-xgmJkbyg.js          [39m[1m[2m  0.51 kB[22m[1m[22m[2m │ gzip:   0.33 kB[22m[2m │ map:     1.25 kB[22m
[2mdist/[22m[2massets/[22m[36muser-plus-RmP0n5e6.js                [39m[1m[2m  0.53 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m[2m │ map:     1.24 kB[22m
[2mdist/[22m[2massets/[22m[36mplug-zap-CswN_pF_.js                 [39m[1m[2m  0.57 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m[2m │ map:     1.25 kB[22m
[2mdist/[22m[2massets/[22m[36mtrash-2-DI3KGQBh.js                  [39m[1m[2m  0.57 kB[22m[1m[22m[2m │ gzip:   0.39 kB[22m[2m │ map:     1.32 kB[22m
[2mdist/[22m[2massets/[22m[36mReadinessScoreBadge-TMgQ-Bpp.js      [39m[1m[2m  0.58 kB[22m[1m[22m[2m │ gzip:   0.36 kB[22m[2m │ map:     1.35 kB[22m
[2mdist/[22m[2massets/[22m[36mphone-BRZS_f2V.js                    [39m[1m[2m  0.61 kB[22m[1m[22m[2m │ gzip:   0.40 kB[22m[2m │ map:     1.04 kB[22m
[2mdist/[22m[2massets/[22m[36mbuilding-2-T6zaoa_D.js               [39m[1m[2m  0.66 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m[2m │ map:     1.46 kB[22m
[2mdist/[22m[2massets/[22m[36mstatusOptions-3W9GPB6v.js            [39m[1m[2m  0.68 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m[2m │ map:     1.95 kB[22m
[2mdist/[22m[2massets/[22m[36mPageHeader-edk4zIKc.js               [39m[1m[2m  0.70 kB[22m[1m[22m[2m │ gzip:   0.41 kB[22m[2m │ map:     2.20 kB[22m
[2mdist/[22m[2massets/[22m[36mbadge-DU-s_7qR.js                    [39m[1m[2m  0.75 kB[22m[1m[22m[2m │ gzip:   0.41 kB[22m[2m │ map:     1.65 kB[22m
[2mdist/[22m[2massets/[22m[36mwrench-Df1epWLh.js                   [39m[1m[2m  0.79 kB[22m[1m[22m[2m │ gzip:   0.43 kB[22m[2m │ map:     1.74 kB[22m
[2mdist/[22m[2massets/[22m[36mStatusBadge-DW63Eryz.js              [39m[1m[2m  0.95 kB[22m[1m[22m[2m │ gzip:   0.47 kB[22m[2m │ map:     2.31 kB[22m
[2mdist/[22m[2massets/[22m[36mmessagingService-CBkaRzmy.js         [39m[1m[2m  1.47 kB[22m[1m[22m[2m │ gzip:   0.69 kB[22m[2m │ map:     5.34 kB[22m
[2mdist/[22m[2massets/[22m[36mEmptyState-CaBKqdg7.js               [39m[1m[2m  1.51 kB[22m[1m[22m[2m │ gzip:   0.75 kB[22m[2m │ map:     4.98 kB[22m
[2mdist/[22m[2massets/[22m[36mAcceptInvitePage-CRi4brdl.js         [39m[1m[2m  1.59 kB[22m[1m[22m[2m │ gzip:   0.82 kB[22m[2m │ map:     3.96 kB[22m
[2mdist/[22m[2massets/[22m[36mteamService-BerXRLiT.js              [39m[1m[2m  1.65 kB[22m[1m[22m[2m │ gzip:   0.73 kB[22m[2m │ map:     5.82 kB[22m
[2mdist/[22m[2massets/[22m[36msmsConfigService-Bl-JYbMi.js         [39m[1m[2m  1.74 kB[22m[1m[22m[2m │ gzip:   0.70 kB[22m[2m │ map:     5.76 kB[22m
[2mdist/[22m[2massets/[22m[36mswitch-DrfHMbaI.js                   [39m[1m[2m  2.53 kB[22m[1m[22m[2m │ gzip:   1.28 kB[22m[2m │ map:     9.86 kB[22m
[2mdist/[22m[2massets/[22m[36museUsage-BqC2BtRV.js                 [39m[1m[2m  2.56 kB[22m[1m[22m[2m │ gzip:   0.99 kB[22m[2m │ map:     9.81 kB[22m
[2mdist/[22m[2massets/[22m[36museMutation-DM24PjoX.js              [39m[1m[2m  2.93 kB[22m[1m[22m[2m │ gzip:   1.25 kB[22m[2m │ map:     8.41 kB[22m
[2mdist/[22m[2massets/[22m[36mrequestsService-D6hYafk1.js          [39m[1m[2m  3.42 kB[22m[1m[22m[2m │ gzip:   1.10 kB[22m[2m │ map:    10.55 kB[22m
[2mdist/[22m[2massets/[22m[36museTeamMembers-Y_xPC4x3.js           [39m[1m[2m  4.54 kB[22m[1m[22m[2m │ gzip:   2.05 kB[22m[2m │ map:    18.18 kB[22m
[2mdist/[22m[2massets/[22m[36mCustomersPage-DCbteje6.js            [39m[1m[2m  4.86 kB[22m[1m[22m[2m │ gzip:   1.88 kB[22m[2m │ map:    12.75 kB[22m
[2mdist/[22m[2massets/[22m[36mMessageTemplatesPage-99pCfHXW.js     [39m[1m[2m  5.40 kB[22m[1m[22m[2m │ gzip:   2.11 kB[22m[2m │ map:    16.05 kB[22m
[2mdist/[22m[2massets/[22m[36mGuideBuilderPage-BCyrPV82.js         [39m[1m[2m  5.47 kB[22m[1m[22m[2m │ gzip:   2.18 kB[22m[2m │ map:    13.35 kB[22m
[2mdist/[22m[2massets/[22m[36mGuideLibraryPage-BgVMQvP2.js         [39m[1m[2m  7.12 kB[22m[1m[22m[2m │ gzip:   2.33 kB[22m[2m │ map:    15.63 kB[22m
[2mdist/[22m[2massets/[22m[36mCustomerDetailPage-BmzaxbBt.js       [39m[1m[2m  8.08 kB[22m[1m[22m[2m │ gzip:   2.85 kB[22m[2m │ map:    19.24 kB[22m
[2mdist/[22m[2massets/[22m[36mGeneratedQuestionEditor-DO6HFd7Y.js  [39m[1m[2m  8.47 kB[22m[1m[22m[2m │ gzip:   2.71 kB[22m[2m │ map:    25.14 kB[22m
[2mdist/[22m[2massets/[22m[36mCustomerFormDialog-kWSTdYbJ.js       [39m[1m[2m  8.81 kB[22m[1m[22m[2m │ gzip:   2.94 kB[22m[2m │ map:    25.99 kB[22m
[2mdist/[22m[2massets/[22m[36mAdminAIRerun-CTFJCqM2.js             [39m[1m[2m  9.65 kB[22m[1m[22m[2m │ gzip:   3.20 kB[22m[2m │ map:    26.20 kB[22m
[2mdist/[22m[2massets/[22m[36mGuideDetailPage-BzlCbGSQ.js          [39m[1m[2m 10.69 kB[22m[1m[22m[2m │ gzip:   3.64 kB[22m[2m │ map:    35.43 kB[22m
[2mdist/[22m[2massets/[22m[36mBrandSettingsPage-CUxxCghm.js        [39m[1m[2m 11.38 kB[22m[1m[22m[2m │ gzip:   3.59 kB[22m[2m │ map:    29.06 kB[22m
[2mdist/[22m[2massets/[22m[36mAdminInvites-BPrKnMWj.js             [39m[1m[2m 11.83 kB[22m[1m[22m[2m │ gzip:   3.61 kB[22m[2m │ map:    36.83 kB[22m
[2mdist/[22m[2massets/[22m[36mRequestDetailPage-BT9ufsrd.js        [39m[1m[2m 11.94 kB[22m[1m[22m[2m │ gzip:   4.63 kB[22m[2m │ map:    34.22 kB[22m
[2mdist/[22m[2massets/[22m[36mSmsSettingsPage-BSYSu_s0.js          [39m[1m[2m 12.94 kB[22m[1m[22m[2m │ gzip:   4.24 kB[22m[2m │ map:    37.13 kB[22m
[2mdist/[22m[2massets/[22m[36mRequestsInboxPage-DtKy51Up.js        [39m[1m[2m 16.04 kB[22m[1m[22m[2m │ gzip:   4.68 kB[22m[2m │ map:    48.88 kB[22m
[2mdist/[22m[2massets/[22m[36mTeamSettingsPage-CdfPqpDl.js         [39m[1m[2m 17.87 kB[22m[1m[22m[2m │ gzip:   5.58 kB[22m[2m │ map:    50.84 kB[22m
[2mdist/[22m[2massets/[22m[36mDashboardPage-BLTuME0h.js            [39m[1m[2m 18.16 kB[22m[1m[22m[2m │ gzip:   5.76 kB[22m[2m │ map:    46.10 kB[22m
[2mdist/[22m[2massets/[22m[36mOnboardingPage-BvUDZkHJ.js           [39m[1m[2m 18.62 kB[22m[1m[22m[2m │ gzip:   4.97 kB[22m[2m │ map:    47.71 kB[22m
[2mdist/[22m[2massets/[22m[36mselect-BtlUTWwx.js                   [39m[1m[2m 21.37 kB[22m[1m[22m[2m │ gzip:   7.55 kB[22m[2m │ map:    90.62 kB[22m
[2mdist/[22m[2massets/[22m[36mCreateRequestPage-B0bhcb7R.js        [39m[1m[2m 21.97 kB[22m[1m[22m[2m │ gzip:   6.86 kB[22m[2m │ map:    53.16 kB[22m
[2mdist/[22m[2massets/[22m[36mWebsiteIntakePage-GeAE_-tk.js        [39m[1m[2m 26.66 kB[22m[1m[22m[2m │ gzip:   7.45 kB[22m[2m │ map:    66.73 kB[22m
[2mdist/[22m[2massets/[22m[36mBillingSettingsPage-Bc82lnuO.js      [39m[1m[2m 31.43 kB[22m[1m[22m[2m │ gzip:  10.83 kB[22m[2m │ map:   118.20 kB[22m
[2mdist/[22m[2massets/[22m[36mIntegrationsPage-D_PdR8Yr.js         [39m[1m[2m 34.11 kB[22m[1m[22m[2m │ gzip:  10.05 kB[22m[2m │ map:    76.81 kB[22m
[2mdist/[22m[2massets/[22m[36mBetaGuidePage-BGTB-IKy.js            [39m[1m[2m 40.52 kB[22m[1m[22m[2m │ gzip:  11.63 kB[22m[2m │ map:    75.83 kB[22m
[2mdist/[22m[2massets/[22m[36mSubmissionReviewPage-D3QJ24vj.js     [39m[1m[2m 50.16 kB[22m[1m[22m[2m │ gzip:  14.01 kB[22m[2m │ map:   146.62 kB[22m
[2mdist/[22m[2massets/[22m[36mtypes-CZyzcKJF.js                    [39m[1m[2m 53.46 kB[22m[1m[22m[2m │ gzip:  12.23 kB[22m[2m │ map:   223.44 kB[22m
[2mdist/[22m[2massets/[22m[36mindex-DnOdPmYg.js                    [39m[1m[33m931.22 kB[39m[22m[2m │ gzip: 267.84 kB[22m[2m │ map: 3,587.75 kB[22m
[33m
(!) Some chunks are larger than 500 kB after minification. Consider:
- Using dynamic import() to code-split the application
- Use build.rollupOptions.output.manualChunks to improve chunking: https://rollupjs.org/configuration-options/#output-manualchunks
- Adjust chunk size limit for this warning via build.chunkSizeWarningLimit.[39m
[32m✓ built in 7.94s[39m
```

## Summary
npm-ci=0
typecheck=0
lint=0
build=0
npm-ci=0
typecheck=0
lint=0
build=0
