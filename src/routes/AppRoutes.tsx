import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PublicRequestLayout } from "@/components/layout/PublicRequestLayout";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequirePlatformAdmin } from "@/components/auth/RequirePlatformAdmin";
import { FeatureGate } from "@/components/shared/FeatureGate";

// Eager entry points: marketing/auth/public capture pages are user-facing first loads.
import LandingPage from "@/pages/Landing";
import AuthPage from "@/pages/Auth";
import PricingPage from "@/pages/Pricing";
import ForAiAgentsPage from "@/pages/ForAiAgents";
import ForgotPasswordPage from "@/pages/ForgotPassword";
import ResetPasswordPage from "@/pages/ResetPassword";
import UnsubscribePage from "@/pages/Unsubscribe";
import WaitlistPage from "@/pages/Waitlist";
import SignupPage from "@/pages/Signup";
import BetaInvitePage from "@/pages/BetaInvite";
import IntakeBadgePage from "@/pages/IntakeBadge";
import PrivacyPage from "@/pages/Privacy";
import TermsPage from "@/pages/Terms";
import NotFound from "@/pages/NotFound";
import PublicRecipientPage from "@/features/capture/pages/PublicRecipientPage";
import RecipientConfirmationPage from "@/features/capture/pages/RecipientConfirmationPage";
import PublicIntakePage from "@/features/intake/pages/PublicIntakePage";

// Lazy app/admin pages keep the marketing bundle focused.
const OnboardingPage = lazy(() => import("@/features/workspace/pages/OnboardingPage"));
const DashboardPage = lazy(() => import("@/features/workspace/pages/DashboardPage"));
const BrandSettingsPage = lazy(() => import("@/features/workspace/pages/BrandSettingsPage"));
const TeamSettingsPage = lazy(() => import("@/features/workspace/pages/TeamSettingsPage"));
const MessageTemplatesPage = lazy(() => import("@/features/workspace/pages/MessageTemplatesPage"));
const SmsSettingsPage = lazy(() => import("@/features/workspace/pages/SmsSettingsPage"));
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
const AcceptInvitePage = lazy(() => import("@/features/workspace/pages/AcceptInvitePage"));
const BetaGuidePage = lazy(() => import("@/features/help/pages/BetaGuidePage"));
const AdminInvitesPage = lazy(() => import("@/pages/AdminInvites"));
const AdminAIRerunPage = lazy(() => import("@/pages/AdminAIRerun"));
const AdminCommandCenter = lazy(() => import("@/pages/AdminCommandCenter"));
const SupportPage = lazy(() => import("@/features/support/pages/SupportPage"));
const BetaPortfolioPage = lazy(() => import("@/pages/BetaPortfolio"));
const BetaWelcomePage = lazy(() => import("@/pages/BetaWelcome"));

function AuthOnly({ children, requireOnboarding = true }: { children: ReactNode; requireOnboarding?: boolean }) {
  return <RequireAuth requireOnboarding={requireOnboarding}>{children}</RequireAuth>;
}

function PlatformAdminOnly({ children }: { children: ReactNode }) {
  return (
    <AuthOnly requireOnboarding={false}>
      <RequirePlatformAdmin>{children}</RequirePlatformAdmin>
    </AuthOnly>
  );
}

function WebsiteIntakeRoute() {
  return (
    <FeatureGate
      feature="website_intake"
      title="Website Intake unlocks on Pro."
      description="Free and Starter are for manually creating and sending clickable PhotoBrief links. Pro adds the automation layer that turns website leads into routed PhotoBrief requests."
      bullets={[
        "Hosted Website Intake form for your site CTA",
        "Guided setup for Wix, Squarespace, WordPress, Webflow, Shopify, GoDaddy, Carrd, Zapier, and Make",
        "Template routing for request types and messages",
        "Webhook setup for existing website forms",
      ]}
    >
      <WebsiteIntakePage />
    </FeatureGate>
  );
}

function MarketingRoutes() {
  return (
    <Route element={<MarketingLayout />}>
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/for-ai-agents" element={<ForAiAgentsPage />} />
      <Route path="/founding-partner-beta" element={<BetaPortfolioPage />} />
      <Route path="/beta-portfolio" element={<Navigate to="/founding-partner-beta" replace />} />
      <Route path="/betalist" element={<Navigate to="/?utm_source=betalist" replace />} />
      <Route path="/welcome" element={<BetaWelcomePage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/unsubscribe" element={<UnsubscribePage />} />
      <Route path="/help" element={<BetaGuidePage />} />
      <Route path="/waitlist" element={<WaitlistPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/beta-invite/:token" element={<BetaInvitePage />} />
    </Route>
  );
}

function AccountSetupRoutes() {
  return (
    <Route element={<MarketingLayout />}>
      <Route
        path="/onboarding"
        element={
          <AuthOnly requireOnboarding={false}>
            <OnboardingPage />
          </AuthOnly>
        }
      />
      <Route
        path="/invite/:token"
        element={
          <AuthOnly requireOnboarding={false}>
            <AcceptInvitePage />
          </AuthOnly>
        }
      />
    </Route>
  );
}

function DashboardRoutes() {
  return (
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
      <Route path="/intake" element={<WebsiteIntakeRoute />} />
      <Route path="/settings/brand" element={<BrandSettingsPage />} />
      <Route path="/settings/team" element={<TeamSettingsPage />} />
      <Route path="/settings/templates" element={<MessageTemplatesPage />} />
      <Route path="/settings/sms" element={<SmsSettingsPage />} />
      <Route path="/settings/integrations" element={<IntegrationsPage />} />
      <Route path="/settings/billing" element={<BillingSettingsPage />} />
      <Route path="/app/help" element={<BetaGuidePage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/admin/invites" element={<PlatformAdminOnly><AdminInvitesPage /></PlatformAdminOnly>} />
      <Route path="/admin/ai-rerun" element={<PlatformAdminOnly><AdminAIRerunPage /></PlatformAdminOnly>} />
      <Route path="/admin/command" element={<PlatformAdminOnly><AdminCommandCenter /></PlatformAdminOnly>} />
    </Route>
  );
}

function PublicRoutes() {
  return (
    <>
      <Route path="/badge/intake" element={<IntakeBadgePage />} />
      <Route path="/i/:token" element={<PublicIntakePage />} />
      <Route element={<PublicRequestLayout />}>
        <Route path="/r/:token" element={<PublicRecipientPage />} />
        <Route path="/r/:token/done" element={<RecipientConfirmationPage />} />
      </Route>
    </>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        {MarketingRoutes()}
        {AccountSetupRoutes()}
        {DashboardRoutes()}
        {PublicRoutes()}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
