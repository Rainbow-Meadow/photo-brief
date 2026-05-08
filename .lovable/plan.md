
# Diagnostic Sweep: Fragility Sources

After inspecting hooks, services, App.tsx, auth flow, query config, retry logic, and the DB linter, here are the concrete issues making the app fragile, ranked by impact.

---

## 1. No global React Query defaults (HIGH)

`new QueryClient()` at line 76 of App.tsx has **zero configuration** -- no `staleTime`, no `retry`, no `refetchOnWindowFocus` control. This means:
- Every query refetches on window focus (tab switch = waterfall of Supabase calls)
- Default retry is 3, which stacks on top of `withSupabaseRetry` (2 attempts) = up to **6 requests** per failure
- No `gcTime`/`staleTime` so cache is invalidated aggressively

**Fix:** Add sensible defaults:
```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30s before refetch
      gcTime: 5 * 60_000,       // 5 min cache
      retry: 1,                 // 1 retry (supabaseRetry handles transients)
      refetchOnWindowFocus: false,
    },
  },
});
```

---

## 2. 37+ Supabase calls with NO retry wrapper (HIGH)

`withSupabaseRetry` exists but is only used in `useCurrentWorkspace`. Every service call in `guidesService`, `submissionsService`, `requestsService`, `messagingService`, etc. calls Supabase raw. During a 503 window (instance restart), **every service call fails silently or throws an uncaught error**.

**Fix:** Wrap critical service calls in `withSupabaseRetry`, or add a global PostgREST retry interceptor.

---

## 3. 13 `.single()` calls that throw on empty results (MEDIUM-HIGH)

`.single()` returns an error (406) if zero rows match. If a guide/request/customer was deleted or hasn't been created yet, the call errors out instead of returning `null`. This is different from `.maybeSingle()` which returns null gracefully.

Affected services: `messagingService`, `requestsService`, `websiteIntakeService`, `messageTemplatesService`, `guidesService`, `customersService`, `apiKeysService`, `submissionsService`.

**Fix:** Audit each `.single()` -- use `.maybeSingle()` where the row may not exist (lookups by ID from URL params, optional records).

---

## 4. Auth race condition between getSession and onAuthStateChange (MEDIUM)

In `useAuth.tsx`, both `getSession()` and `onAuthStateChange` call `setSession` independently. On a slow network, `getSession` can resolve with a stale/null session *after* `onAuthStateChange` has already fired with the correct session, overwriting good state with bad state.

**Fix:** Use a ref flag: once `onAuthStateChange` fires, skip the `getSession` result.

---

## 5. No Error Boundary (MEDIUM)

The app has `<Suspense fallback={null}>` but **no ErrorBoundary**. Any uncaught render error (bad data shape from Supabase, null ref, etc.) crashes the entire app with a white screen. This is the single most common cause of "the app just went blank."

**Fix:** Add a top-level `<ErrorBoundary>` around routes with a fallback UI and a "reload" button.

---

## 6. Landing page is 1,622 lines with 23 imports, not lazy-loaded (MEDIUM)

Landing.tsx is eagerly imported (not behind `lazy()`), so it's in the initial bundle. With 30 component imports, it pulls a lot of code into the critical path. This affects initial load time and increases the chance of a single component error crashing the whole page.

**Fix:** Lazy-load Landing like the other pages, and consider splitting the 30 sub-components into a barrel import or dynamic sections.

---

## 7. Suspense fallback is `null` (LOW-MEDIUM)

`<Suspense fallback={null}>` means lazy-loaded pages show nothing while loading. Combined with no error boundary, a slow chunk load = blank screen with no feedback.

**Fix:** Replace `null` with a simple loading spinner or skeleton.

---

## 8. DB security warnings (LOW -- not fragility but noted)

The linter found 16 warnings:
- 2 functions without `search_path` set
- 3 public buckets allowing file listing
- Multiple `SECURITY DEFINER` functions callable by anon/authenticated without explicit revoke

These don't cause runtime fragility but could cause unexpected behavior under adversarial conditions.

---

## Recommended implementation order

1. QueryClient defaults (instant win, ~5 min)
2. Error Boundary (prevents white-screen crashes, ~10 min)
3. `.single()` --> `.maybeSingle()` audit (~15 min)
4. Auth race condition fix (~10 min)
5. Lazy-load Landing + Suspense fallback (~10 min)
6. Retry wrapper on critical services (larger effort, ~30 min)
7. DB security fixes (migration, separate effort)
