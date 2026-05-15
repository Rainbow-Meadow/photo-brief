import { lazy, Suspense } from "react";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "@/hooks/useAuth";
import { LenisProvider } from "@/lib/motion/lenis";
import { GrainOverlay } from "@/components/motion/GrainOverlay";

import { CurrentWorkspaceProvider } from "@/hooks/useCurrentWorkspace";
import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PublicRequestLayout } from "@/components/layout/PublicRequestLayout";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RouteTracker } from "@/components/analytics/RouteTracker";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { FeatureGate } from "@/components/shared/FeatureGate";

// All route components are lazy-loaded so each page (especially the marketing
// landing at "/") only ships its own JS. Suspense fallback covers transitions.
const LandingPage = lazy(() => import("@/pages/Landing"));
const AuthPage = lazy(() => import("@/pages/Auth"));
const PricingPage = lazy(() => import("@/pages/Pricing"));
const ForAiAgentsPage = lazy(() => import("@/pages/ForAiAgents"));
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPassword"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPassword"));
const UnsubscribePage = lazy(() => import("@/pages/Unsubscribe"));
const IntakeBadgePage = lazy(() => import("@/pages/IntakeBadge"));
const PrivacyPage = lazy(() => import("@/pages/Privacy"));
const TermsPage = lazy(() => import("@/pages/Terms"));
const RefundPage = lazy(() => import("@/pages/Refund"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const DemoPage = lazy(() => import("@/pages/Demo"));
const PublicRecipientPage = lazy(() => import("@/features/capture/pages/PublicRecipientPage"));
const RecipientConfirmationPage = lazy(() => import("@/features/capture/pages/RecipientConfirmationPage"));
const PublicIntakePage = lazy(() => import("@/features/intake/pages/PublicIntakePage"));

import { RequirePlatformAdmin } from "@/components/auth/RequirePlatformAdmin";

// Lazy: authenticated business app + onboarding + help. These pages are only
// reachable after sign-in, so splitting them out of the initial bundle removes
// ~hundreds of KB of script-eval/parse work from the marketing landing page
// without changing any UX (RequireAuth + Suspense fallback covers transitions).
const OnboardingPage = lazy(() => import("@/features/workspace/pages/OnboardingPage"));
const DashboardPage = lazy(() => import("@/features/workspace/pages/DashboardPage"));
const BrandSettingsPage = lazy(() => import("@/features/workspace/pages/BrandSettingsPage"));
const TeamSettingsPage = lazy(() => import("@/features/workspace/pages/TeamSettingsPage"));
const MessageTemplatesPage = lazy(() => import("@/features/workspace/pages/MessageTemplatesPage"));
const SmsSettingsPage = lazy(() => import("@/features/workspace/pages/SmsSettingsPage"));
const AgentTeamPage = lazy(() => import("@/features/workspace/pages/AgentTeamPage"));
const BillingSettingsPage = lazy(() => import("@/features/billing/pages/BillingSettingsPage"));
const IntegrationsPage = lazy(() => import("@/features/integrations/pages/IntegrationsPage"));
const RequestsInboxPage = lazy(() => import("@/features/requests/pages/RequestsInboxPage"));
const CreateRequestPage = lazy(() => import("@/features/requests/pages/CreateRequestPage"));
const RequestDetailPage = lazy(() => import("@/features/requests/pages/RequestDetailPage"));
const SubmissionReviewPage = lazy(() => import("@/features/submissions/pages/SubmissionReviewPage"));
const GuideLibraryPage = lazy(() => import("@/features/guides/pages/GuideLibraryPage"));
const GuideBuilderPage = lazy(() => import("@/features/guides/pages/GuideBuilderPage"));
const GuideDetailPage = lazy(() => import("@/features/guides/pages/GuideDetailPage"));
const CustomersPage = lazy(() => import("@/features/customers/pages/CustomersPage"));
const CustomerDetailPage = lazy(() => import("@/features/customers/pages/CustomerDetailPage"));
const WebsiteIntakePage = lazy(() => import("@/features/intake/pages/WebsiteIntakePage"));
const IntakeBriefsPage = lazy(() => import("@/features/intake/pages/IntakeBriefsPage"));
const IntakeBriefDetailPage = lazy(() => import("@/features/intake/pages/IntakeBriefDetailPage"));
const AcceptInvitePage = lazy(() => import("@/features/workspace/pages/AcceptInvitePage"));
const HelpPage = lazy(() => import("@/features/help/pages/HelpPage"));
const AdminInvitesPage = lazy(() => import("@/pages/AdminInvites"));
const AdminAIRerunPage = lazy(() => import("@/pages/AdminAIRerun"));
const AdminCommandCenter = lazy(() => import("@/pages/AdminCommandCenter"));
const AdminBetaPage = lazy(() => import("@/pages/AdminBeta"));
const AdminWebsiteIntelligencePage = lazy(() => import("@/pages/AdminWebsiteIntelligence"));
const AdminExitInterviewsPage = lazy(() => import("@/pages/AdminExitInterviews"));
const SupportPage = lazy(() => import("@/features/support/pages/SupportPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PaymentTestModeBanner />
      <BrowserRouter>
        <AuthProvider>
        <CurrentWorkspaceProvider>
          <LenisProvider>
          <GrainOverlay />
          <RouteTracker />
          <ErrorBoundary>
          <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>}>
          <Routes>
          {/* Marketing + auth */}
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/for-ai-agents" element={<ForAiAgentsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/refund-policy" element={<RefundPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/unsubscribe" element={<UnsubscribePage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/demo" element={<DemoPage />} />
          </Route>

          {/* Lightweight embeddable brand surface for customer websites. */}
          <Route path="/badge/intake" element={<IntakeBadgePage />} />

          {/* Onboarding + invite acceptance (no sidebar, but still auth-only).
              Onboarding intentionally skips the onboarding gate to avoid loops. */}
          <Route element={<MarketingLayout />}>
            <Route
              path="/onboarding"
              element={
                <RequireAuth requireOnboarding={false}>
                  <OnboardingPage />
                </RequireAuth>
              }
            />
            <Route
              path="/invite/:token"
              element={
                <RequireAuth requireOnboarding={false}>
                  <AcceptInvitePage />
                </RequireAuth>
              }
            />
          </Route>

          {/* Authenticated business app */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/requests" element={<RequestsInboxPage />} />
            <Route path="/requests/new" element={<CreateRequestPage />} />
            <Route path="/requests/:id" element={<RequestDetailPage />} />
            <Route path="/submissions/:id" element={<SubmissionReviewPage />} />
            <Route path="/guides" element={<GuideLibraryPage />} />
            <Route path="/guides/new" element={<GuideBuilderPage />} />
            <Route path="/guides/:id" element={<GuideDetailPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
            <Route
              path="/intake"
              element={
                <FeatureGate
                  feature="website_intake"
                  title="Smart Intake unlocks on Pro."
                  description="Free and Starter are for manually creating and sending clickable PhotoBrief links. Pro replaces basic website forms with routed intake briefs and only asks for photos when the selected route needs them."
                  bullets={[
                    "Hosted Smart Intake form for your site CTA",
                    "Guided setup for Wix, Squarespace, WordPress, Webflow, Shopify, GoDaddy, Carrd, Zapier, and Make",
                    "AI-assisted request routing and intake brief creation",
                    "Conditional photo handoff for required-photo routes",
                  ]}
                >
                  <WebsiteIntakePage />
                </FeatureGate>
              }
            />
            <Route
              path="/intake/briefs"
              element={
                <FeatureGate
                  feature="website_intake"
                  title="Smart Intake unlocks on Pro."
                  description="Smart Intake briefs replace basic website-form submissions with routed, review-ready context."
                >
                  <IntakeBriefsPage />
                </FeatureGate>
              }
            />
            <Route
              path="/intake/briefs/:id"
              element={
                <FeatureGate
                  feature="website_intake"
                  title="Smart Intake unlocks on Pro."
                  description="Smart Intake briefs replace basic website-form submissions with routed, review-ready context."
                >
                  <IntakeBriefDetailPage />
                </FeatureGate>
              }
            />
            <Route path="/settings/brand" element={<BrandSettingsPage />} />
            <Route path="/settings/team" element={<TeamSettingsPage />} />
            <Route path="/settings/templates" element={<MessageTemplatesPage />} />
            <Route path="/settings/sms" element={<SmsSettingsPage />} />
            <Route path="/settings/integrations" element={<IntegrationsPage />} />
            <Route path="/settings/billing" element={<BillingSettingsPage />} />
            <Route path="/settings/agents" element={<AgentTeamPage />} />
            <Route path="/app/help" element={<HelpPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route
              path="/admin/invites"
              element={
                <RequireAuth requireOnboarding={false}>
                  <RequirePlatformAdmin>
                    <AdminInvitesPage />
                  </RequirePlatformAdmin>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/ai-rerun"
              element={
                <RequireAuth requireOnboarding={false}>
                  <RequirePlatformAdmin>
                    <AdminAIRerunPage />
                  </RequirePlatformAdmin>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/command"
              element={
                <RequireAuth requireOnboarding={false}>
                  <RequirePlatformAdmin>
                    <AdminCommandCenter />
                  </RequirePlatformAdmin>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/beta"
              element={
                <RequireAuth requireOnboarding={false}>
                  <RequirePlatformAdmin>
                    <AdminBetaPage />
                  </RequirePlatformAdmin>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/website-intelligence"
              element={
                <RequireAuth requireOnboarding={false}>
                  <RequirePlatformAdmin>
                    <AdminWebsiteIntelligencePage />
                  </RequirePlatformAdmin>
                </RequireAuth>
              }
            />
            <Route
              path="/admin/exit-interviews"
              element={
                <RequireAuth requireOnboarding={false}>
                  <RequirePlatformAdmin>
                    <AdminExitInterviewsPage />
                  </RequirePlatformAdmin>
                </RequireAuth>
              }
            />
          </Route>

          {/* Public intake + recipient capture */}
          <Route path="/i/:token" element={<PublicIntakePage />} />
          <Route element={<PublicRequestLayout />}>
            <Route path="/r/:token" element={<PublicRecipientPage />} />
            <Route path="/r/:token/done" element={<RecipientConfirmationPage />} />
          </Route>

          <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
          </ErrorBoundary>
          </LenisProvider>
        </CurrentWorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
