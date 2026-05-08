import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  BookOpen,
  Users,
  CreditCard,
  Settings,
  Sparkles,
  FileText,
  MessageSquare,
  LifeBuoy,
  Globe2,
  Plug,
  Shield,
  ScanSearch,
  Terminal,
  UserPlus,
  Bot,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { BrandMark } from "@/components/layout/BrandMark";
import { UpgradePromptCard } from "@/components/shared/UpgradePromptCard";
import { WorkspaceSwitcher } from "@/features/workspace/components/WorkspaceSwitcher";
import { usePlan } from "@/hooks/usePlan";
import { usePlatformAdmin } from "@/hooks/usePlatformAdmin";
import { cn } from "@/lib/utils";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Requests", url: "/requests", icon: Inbox },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Guides", url: "/guides", icon: BookOpen },
  { title: "Website Intake", url: "/intake", icon: Globe2, feature: "website_intake" as const },
];

const adminItems = [
  { title: "Command Center", url: "/admin/command", icon: Terminal },
  { title: "Beta Program", url: "/admin/beta", icon: Shield },
  { title: "Invites", url: "/admin/invites", icon: UserPlus },
  { title: "AI Rerun", url: "/admin/ai-rerun", icon: Bot },
  { title: "Website Intel", url: "/admin/website-intelligence", icon: ScanSearch },
];
const settingsItems = [
  { title: "Brand", url: "/settings/brand", icon: Sparkles },
  { title: "Team", url: "/settings/team", icon: Settings },
  { title: "Templates", url: "/settings/templates", icon: FileText },
  { title: "SMS", url: "/settings/sms", icon: MessageSquare },
  { title: "Integrations", url: "/settings/integrations", icon: Plug },
  { title: "Billing", url: "/settings/billing", icon: CreditCard },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { plan, loading: planLoading, can } = usePlan();
  const { isAdmin } = usePlatformAdmin();
  // Hide the upgrade card for users already on Pro or higher.
  // Plans below Pro: free, starter. Don't render until plan is resolved
  // to avoid flashing the wrong CTA during the brief auth/workspace load.
  const showUpgradeCard = !planLoading && (plan === "free" || plan === "starter");
  const { pathname } = useLocation();

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="hairline-apple-b bg-sidebar overflow-hidden">
        <div
          className={cn(
            "flex h-12 items-center",
            collapsed ? "justify-center px-0" : "justify-start px-2",
          )}
        >
          <BrandMark
            variant={collapsed ? "mark" : "horizontal"}
            tone="light"
            size={collapsed ? 24 : 30}
            eager
          />
        </div>
        {!collapsed ? (
          <div className="px-2 pb-2">
            <WorkspaceSwitcher />
          </div>
        ) : null}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                const locked = item.feature ? !can(item.feature) : false;
                const tooltip = locked ? `${item.title} · Pro` : item.title;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={tooltip}>
                      <NavLink to={item.url} className="tap-apple focus-apple flex items-center gap-2 text-callout">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && (
                          <>
                            <span className="min-w-0 flex-1">{item.title}</span>
                            {locked ? (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                                Pro
                              </span>
                            ) : null}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink to={item.url} className="tap-apple focus-apple flex items-center gap-2 text-callout">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/support")} tooltip="Support">
                  <NavLink to="/support" className="tap-apple focus-apple flex items-center gap-2 text-callout">
                    <MessageSquare className="h-4 w-4" />
                    {!collapsed && <span>Support</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/app/help")} tooltip="Help & Guide">
                  <NavLink to="/app/help" className="tap-apple focus-apple flex items-center gap-2 text-callout">
                    <LifeBuoy className="h-4 w-4" />
                    {!collapsed && <span>Help & Guide</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin ? (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                      <NavLink to={item.url} className="tap-apple focus-apple flex items-center gap-2 text-callout">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      {!collapsed && showUpgradeCard ? (
        <SidebarFooter className="gap-2 p-2">
          <UpgradePromptCard feature="website_intake" />
        </SidebarFooter>
      ) : null}
    </Sidebar>
  );
}
