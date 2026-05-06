import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CreditCard,
  FileText,
  Globe2,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  MessageSquare,
  Plug,
  Sparkles,
  Users,
} from "lucide-react";

export const routes = {
  marketing: {
    home: "/",
    pricing: "/pricing",
    aiAgents: "/for-ai-agents",
    foundingBeta: "/founding-partner-beta",
    betaPortfolioLegacy: "/beta-portfolio",
    betaListLegacy: "/betalist",
    welcome: "/welcome",
    privacy: "/privacy",
    terms: "/terms",
    help: "/help",
    waitlist: "/waitlist",
    signup: "/signup",
    auth: "/auth",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
    unsubscribe: "/unsubscribe",
  },
  setup: {
    onboarding: "/onboarding",
    invite: "/invite/:token",
    betaInvite: "/beta-invite/:token",
  },
  app: {
    dashboard: "/dashboard",
    requests: "/requests",
    newRequest: "/requests/new",
    requestDetail: "/requests/:id",
    submissionReview: "/submissions/:id",
    guides: "/guides",
    newGuide: "/guides/new",
    guideDetail: "/guides/:id",
    customers: "/customers",
    customerDetail: "/customers/:id",
    intake: "/intake",
    support: "/support",
    help: "/app/help",
  },
  settings: {
    brand: "/settings/brand",
    team: "/settings/team",
    templates: "/settings/templates",
    sms: "/settings/sms",
    integrations: "/settings/integrations",
    billing: "/settings/billing",
  },
  admin: {
    invites: "/admin/invites",
    aiRerun: "/admin/ai-rerun",
    command: "/admin/command",
  },
  public: {
    badgeIntake: "/badge/intake",
    intake: "/i/:token",
    request: "/r/:token",
    requestDone: "/r/:token/done",
  },
} as const;

type MarketingNavItem = { to: string; label: string };
type FeatureKey = "website_intake";
type AppNavItem = { title: string; url: string; icon: LucideIcon; feature?: FeatureKey };
type SettingsNavItem = { title: string; label: string; url: string; description: string; icon: LucideIcon };
type MobileNavItem = { key: string; label: string; icon: LucideIcon; to: string };

export const marketingNavItems: MarketingNavItem[] = [
  { to: routes.marketing.foundingBeta, label: "Founding Beta" },
  { to: routes.marketing.pricing, label: "Pricing" },
  { to: routes.marketing.help, label: "Help" },
];

export const legalNavItems: MarketingNavItem[] = [
  { to: routes.marketing.privacy, label: "Privacy" },
  { to: routes.marketing.terms, label: "Terms" },
];

export const footerNavItems: MarketingNavItem[] = [
  ...marketingNavItems,
  { to: routes.marketing.aiAgents, label: "For AI agents" },
  ...legalNavItems,
];

export const workspaceNavItems: AppNavItem[] = [
  { title: "Dashboard", url: routes.app.dashboard, icon: LayoutDashboard },
  { title: "Requests", url: routes.app.requests, icon: Inbox },
  { title: "Customers", url: routes.app.customers, icon: Users },
  { title: "Guides", url: routes.app.guides, icon: BookOpen },
  { title: "Website Intake", url: routes.app.intake, icon: Globe2, feature: "website_intake" },
];

export const settingsNavItems: SettingsNavItem[] = [
  { title: "Brand", label: "Brand", url: routes.settings.brand, description: "Logo, colors, recipient page", icon: Sparkles },
  { title: "Team", label: "Team", url: routes.settings.team, description: "Members, roles, invites", icon: Users },
  { title: "Templates", label: "Message templates", url: routes.settings.templates, description: "Reminders & follow-ups", icon: FileText },
  { title: "SMS", label: "SMS", url: routes.settings.sms, description: "Phone number & delivery", icon: MessageSquare },
  { title: "Integrations", label: "Integrations", url: routes.settings.integrations, description: "Website, email, SMS, CRM", icon: Plug },
  { title: "Billing", label: "Billing & plan", url: routes.settings.billing, description: "Subscription, usage, invoices", icon: CreditCard },
];

export const resourceNavItems: AppNavItem[] = [
  { title: "Support", url: routes.app.support, icon: MessageSquare },
  { title: "Help & Guide", url: routes.app.help, icon: LifeBuoy },
];

export const mobilePrimaryNavItems: MobileNavItem[] = [
  { key: "dashboard", label: "Home", icon: LayoutDashboard, to: routes.app.dashboard },
  { key: "requests", label: "Requests", icon: Inbox, to: routes.app.requests },
  { key: "guides", label: "Guides", icon: BookOpen, to: routes.app.guides },
];
