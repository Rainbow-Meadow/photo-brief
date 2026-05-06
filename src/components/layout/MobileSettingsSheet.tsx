import { NavLink } from "react-router-dom";
import { ChevronRight, KeyRound, LogOut } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useAccountActions } from "@/features/account/useAccountActions";
import { settingsNavItems } from "@/routes/navigation";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Full-height bottom sheet that lists the workspace settings group.
 * Its links come from the same navigation map used by the desktop sidebar.
 */
export function MobileSettingsSheet({ open, onOpenChange }: Props) {
  const { resetPassword, logOut, resetting, signingOut, email } = useAccountActions();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0">
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Configure your workspace.</SheetDescription>
        </SheetHeader>
        <div className="flex h-full flex-col overflow-y-auto pb-safe">
          <ul className="divide-y divide-[hsl(var(--glass-border))]">
            {settingsNavItems.map((item) => (
              <li key={item.url}>
                <NavLink
                  to={item.url}
                  onClick={() => onOpenChange(false)}
                  className="pb-settings-row flex items-center gap-3 px-5 py-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="mt-2 border-t">
            <p className="px-5 pb-2 pt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Account
            </p>
            {email ? (
              <p className="px-5 pb-2 text-xs text-muted-foreground">
                Signed in as <span className="font-medium text-foreground">{email}</span>
              </p>
            ) : null}
            <ul className="divide-y divide-[hsl(var(--glass-border))]">
              <li>
                <button
                  type="button"
                  disabled={resetting || !email}
                  onClick={() => {
                    resetPassword();
                  }}
                  className="pb-settings-row flex w-full items-center gap-3 px-5 py-4 text-left disabled:opacity-60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <KeyRound className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {resetting ? "Sending link…" : "Reset password"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      Email yourself a secure link to set a new password.
                    </p>
                  </div>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  disabled={signingOut}
                  onClick={() => {
                    onOpenChange(false);
                    logOut();
                  }}
                  className="pb-settings-row flex w-full items-center gap-3 px-5 py-4 text-left disabled:opacity-60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                    <LogOut className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-destructive">
                      {signingOut ? "Signing out…" : "Log out"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      End this session on this device.
                    </p>
                  </div>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
