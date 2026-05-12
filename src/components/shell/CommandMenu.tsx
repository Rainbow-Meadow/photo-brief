import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  Users,
  BookOpen,
  Globe2,
  Sparkles,
  Settings,
  FileText,
  MessageSquare,
  Plug,
  CreditCard,
  LifeBuoy,
  Plus,
  KeyRound,
  LogOut,
  Terminal,
  Shield,
  UserPlus,
  Bot,
  ScanSearch,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useAccountActions } from "@/features/account/useAccountActions";
import { usePlatformAdmin } from "@/hooks/usePlatformAdmin";

interface NavCmd {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
  shortcut?: string;
  keywords?: string[];
}

const NAV: NavCmd[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard", shortcut: "G D" },
  { label: "Requests", icon: Inbox, to: "/requests", shortcut: "G R" },
  { label: "Customers", icon: Users, to: "/customers", shortcut: "G C" },
  { label: "Guides", icon: BookOpen, to: "/guides", shortcut: "G U" },
  { label: "Website Intake", icon: Globe2, to: "/intake", shortcut: "G I" },
];

const SETTINGS: NavCmd[] = [
  { label: "Brand", icon: Sparkles, to: "/settings/brand" },
  { label: "Team", icon: Settings, to: "/settings/team" },
  { label: "Templates", icon: FileText, to: "/settings/templates" },
  { label: "SMS", icon: MessageSquare, to: "/settings/sms" },
  { label: "Integrations", icon: Plug, to: "/settings/integrations" },
  { label: "Billing", icon: CreditCard, to: "/settings/billing" },
];

const ADMIN: NavCmd[] = [
  { label: "Command Center", icon: Terminal, to: "/admin/command" },
  { label: "Beta Program", icon: Shield, to: "/admin/beta" },
  { label: "Invites", icon: UserPlus, to: "/admin/invites" },
  { label: "AI Rerun", icon: Bot, to: "/admin/ai-rerun" },
  { label: "Website Intel", icon: ScanSearch, to: "/admin/website-intelligence" },
];

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { resetPassword, logOut } = useAccountActions();
  const { isAdmin } = usePlatformAdmin();

  const go = useCallback(
    (to: string) => {
      setOpen(false);
      navigate(to);
    },
    [navigate],
  );

  // Cmd/Ctrl+K toggle
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Linear-style "g then x" sequences (only when menu is closed)
  useEffect(() => {
    if (open) return;
    let armed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const map: Record<string, string> = {
      d: "/dashboard",
      r: "/requests",
      c: "/customers",
      u: "/guides",
      i: "/intake",
    };
    const isTyping = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el.isContentEditable
      );
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isTyping(e.target)) return;
      const key = e.key.toLowerCase();
      if (!armed && key === "g") {
        armed = true;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          armed = false;
        }, 800);
        return;
      }
      if (armed && map[key]) {
        e.preventDefault();
        armed = false;
        if (timer) clearTimeout(timer);
        navigate(map[key]);
        return;
      }
      if (armed) armed = false;
      // 'c' alone → new request
      if (!armed && key === "c" && !e.shiftKey) {
        e.preventDefault();
        navigate("/requests/new");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (timer) clearTimeout(timer);
    };
  }, [open, navigate]);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search or jump to…" />
      <CommandList>
        <CommandEmpty>No matches.</CommandEmpty>

        <CommandGroup heading="Create">
          <CommandItem onSelect={() => go("/requests/new")}>
            <Plus className="mr-2" />
            New request
            <CommandShortcut>C</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => go("/guides")}>
            <BookOpen className="mr-2" />
            New guide
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigate">
          {NAV.map((c) => (
            <CommandItem key={c.to} onSelect={() => go(c.to)}>
              <c.icon className="mr-2" />
              {c.label}
              {c.shortcut ? <CommandShortcut>{c.shortcut}</CommandShortcut> : null}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Settings">
          {SETTINGS.map((c) => (
            <CommandItem key={c.to} onSelect={() => go(c.to)}>
              <c.icon className="mr-2" />
              {c.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Resources">
          <CommandItem onSelect={() => go("/support")}>
            <MessageSquare className="mr-2" />
            Support
          </CommandItem>
          <CommandItem onSelect={() => go("/app/help")}>
            <LifeBuoy className="mr-2" />
            Help &amp; Guide
          </CommandItem>
        </CommandGroup>

        {isAdmin ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Admin">
              {ADMIN.map((c) => (
                <CommandItem key={c.to} onSelect={() => go(c.to)}>
                  <c.icon className="mr-2" />
                  {c.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}

        <CommandSeparator />

        <CommandGroup heading="Account">
          <CommandItem
            onSelect={() => {
              setOpen(false);
              resetPassword();
            }}
          >
            <KeyRound className="mr-2" />
            Reset password
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setOpen(false);
              logOut();
            }}
          >
            <LogOut className="mr-2" />
            Log out
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
