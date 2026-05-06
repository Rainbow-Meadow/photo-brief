import { NavLink, useLocation } from "react-router-dom";

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
import { cn } from "@/lib/utils";
import { resourceNavItems, settingsNavItems, workspaceNavItems } from "@/routes/navigation";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { plan, loading: planLoading, can } = usePlan();
  const showUpgradeCard = !planLoading && (plan === "free" || plan === "starter");
  const { pathname } = useLocation();

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border bg-sidebar overflow-hidden">
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
              {workspaceNavItems.map((item) => {
                const locked = item.feature ? !can(item.feature) : false;
                const tooltip = locked ? `${item.title} · Pro` : item.title;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={tooltip}>
                      <NavLink to={item.url} className="pb-nav-link flex items-center gap-2">
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
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink to={item.url} className="pb-nav-link flex items-center gap-2">
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
              {resourceNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <NavLink to={item.url} className="pb-nav-link flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {!collapsed && showUpgradeCard ? (
        <SidebarFooter className="gap-2 p-2">
          <UpgradePromptCard feature="website_intake" />
        </SidebarFooter>
      ) : null}
    </Sidebar>
  );
}
