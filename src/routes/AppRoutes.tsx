import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { MarketingLayout } from "@/components/layout/MarketingLayout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PublicRequestLayout } from "@/components/layout/PublicRequestLayout";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequirePlatformAdmin } from "@/components/auth/RequirePlatformAdmin";
import { FeatureGate } from "@/components/shared/FeatureGate";
import { routes } from "@/routes/navigation";

// Eager entry points: marketing/auth/public capture pages are user-facing first loads.
import LandingPage from "@/pages/Landing";
import AuthPage from "@/pages/Auth";
import PricingPage from "@/pages/Pricing";
import ForAiAgentsPage from "@/pages/ForAiAgents";
import ForgotPasswordPage from "@/pages/ForgotPassword";
import ResetPasswordPage from "@/pages/ResetPassword";
import UnsubscribePage from "@/pages/Unsubscribe";
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

export function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path={routes.marketing.home} element={<LandingPage />} />
          <Route path={routes.marketing.pricing} element={<PricingPage />} />
          <Route path={routes.marketing.aiAgents} element={<ForAiAgentsPage />} />
          <Route path={routes.marketing.foundingBeta} element={<BetaPortfolioPage />} />
          <Route path={routes.marketing.welcome} element={<BetaWelcomePage />} />
          <Route path={routes.marketing.privacy} element={<PrivacyPage />} />
          <Route path={routes.marketing.terms} element={<TermsPage />} />
          <Route path={routes.marketing.auth} element={<AuthPage />} />
          <Route path={routes.marketing.forgotPassword} element={<ForgotPasswordPage />} />
          <Route path={routes.marketing.resetPassword} element={<ResetPasswordPage />} />
          <Route path={routes.marketing.unsubscribe} element={<UnsubscribePage />} />
          <Route path={routes.marketing.help} element={<BetaGuidePage />} />
          <Route path={routes.marketing.signup} element={<SignupPage />} />
          <Route path={routes.marketing.signup} element={<SignupPage />} />
          <Route path={routes.setup.betaInvite} element={<BetaInvitePage />} />
        </Route>

        <Route path={routes.public.badgeIntake} element={<IntakeBadgePage />} />

        <Route element={<MarketingLayout />}>
          <Route path={routes.setup.onboarding} element={<AuthOnly requireOnboarding={false}><OnboardingPage /></AuthOnly>} />
          <Route path={routes.setup.invite} element={<AuthOnly requireOnboarding={false}><AcceptInvitePage /></AuthOnly>} />
        </Route>

        <Route element={<DashboardLayout />}>
          <Route path={routes.app.dashboard} element={<DashboardPage />} />
          <Route path={routes.app.requests} element={<RequestsInboxPage />} />
          <Route path={routes.app.newRequest} element={<CreateRequestPage />} />
          <Route path={routes.app.requestDetail} element={<RequestDetailPage />} />
          <Route path={routes.app.submissionReview} element={<SubmissionReviewPage />} />
          <Route path={routes.app.guides} element={<GuideLibraryPage />} />
          <Route path={routes.app.newGuide} element={<GuideBuilderPage />} />
          <Route path={routes.app.guideDetail} element={<GuideDetailPage />} />
          <Route path={routes.app.customers} element={<CustomersPage />} />
          <Route path={routes.app.customerDetail} element={<CustomerDetailPage />} />
          <Route path={routes.app.intake} element={<WebsiteIntakeRoute />} />
          <Route path={routes.settings.brand} element={<BrandSettingsPage />} />
          <Route path={routes.settings.team} element={<TeamSettingsPage />} />
          <Route path={routes.settings.templates} element={<MessageTemplatesPage />} />
          <Route path={routes.settings.sms} element={<SmsSettingsPage />} />
          <Route path={routes.settings.integrations} element={<IntegrationsPage />} />
          <Route path={routes.settings.billing} element={<BillingSettingsPage />} />
          <Route path={routes.app.help} element={<BetaGuidePage />} />
          <Route path={routes.app.support} element={<SupportPage />} />
          <Route path={routes.admin.invites} element={<PlatformAdminOnly><AdminInvitesPage /></PlatformAdminOnly>} />
          <Route path={routes.admin.aiRerun} element={<PlatformAdminOnly><AdminAIRerunPage /></PlatformAdminOnly>} />
          <Route path={routes.admin.command} element={<PlatformAdminOnly><AdminCommandCenter /></PlatformAdminOnly>} />
        </Route>

        <Route path={routes.public.intake} element={<PublicIntakePage />} />
        <Route element={<PublicRequestLayout />}>
          <Route path={routes.public.request} element={<PublicRecipientPage />} />
          <Route path={routes.public.requestDone} element={<RecipientConfirmationPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
