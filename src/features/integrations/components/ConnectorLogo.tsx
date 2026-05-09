import { useState } from "react";
import type { LucideIcon } from "lucide-react";

import { BrandMark } from "@/components/layout/BrandMark";
import { cn } from "@/lib/utils";

const connectorLogoMap: Record<string, { slug?: string; label: string; bg?: string; invertOnDark?: boolean }> = {
  gmail: { slug: "gmail", label: "Gmail", bg: "bg-white" },
  
  twilio: { slug: "twilio", label: "Twilio", bg: "bg-white" },
  zapier: { slug: "zapier", label: "Zapier", bg: "bg-white" },
  make: { slug: "make", label: "Make", bg: "bg-white" },
  hubspot: { slug: "hubspot", label: "HubSpot", bg: "bg-white" },
  "google-sheets": { slug: "googlesheets", label: "Google Sheets", bg: "bg-white" },
  wordpress: { slug: "wordpress", label: "WordPress", bg: "bg-white" },
  "wordpress-com": { slug: "wordpress", label: "WordPress.com", bg: "bg-white" },
  webflow: { slug: "webflow", label: "Webflow", bg: "bg-white" },
  wix: { slug: "wix", label: "Wix", bg: "bg-white" },
  slack: { slug: "slack", label: "Slack", bg: "bg-white" },
  telegram: { slug: "telegram", label: "Telegram", bg: "bg-white" },
  airtable: { slug: "airtable", label: "Airtable", bg: "bg-white" },
  shopify: { slug: "shopify", label: "Shopify", bg: "bg-white" },
  jobber: { slug: "jobber", label: "Jobber", bg: "bg-white" },
  servicetitan: { slug: "servicetitan", label: "ServiceTitan", bg: "bg-white" },
  salesforce: { slug: "salesforce", label: "Salesforce", bg: "bg-white" },
};

interface ConnectorLogoProps {
  integrationKey: string;
  name: string;
  fallbackIcon: LucideIcon;
  planned?: boolean;
  className?: string;
}

export function ConnectorLogo({ integrationKey, name, fallbackIcon: FallbackIcon, planned, className }: ConnectorLogoProps) {
  const logo = connectorLogoMap[integrationKey];
  const [failed, setFailed] = useState(false);
  const showBrandLogo = logo?.slug && !failed;
  const isInternal = ["website-intake", "site-badge"].includes(integrationKey);

  return (
    <span
      className={cn(
        "flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[0.25rem] border shadow-sm sm:h-16 sm:w-16",
        showBrandLogo ? logo.bg ?? "bg-white" : "bg-primary/10 text-primary",
        planned && "opacity-70 grayscale",
        className,
      )}
    >
      {showBrandLogo ? (
        <img
          src={`https://cdn.simpleicons.org/${logo.slug}`}
          alt={`${logo.label} logo`}
          className="h-8 w-8 object-contain sm:h-9 sm:w-9"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : isInternal ? (
        <BrandMark variant="mark" tone="light" size={34} />
      ) : (
        <FallbackIcon aria-label={`${name} connector`} className="h-7 w-7" />
      )}
    </span>
  );
}
