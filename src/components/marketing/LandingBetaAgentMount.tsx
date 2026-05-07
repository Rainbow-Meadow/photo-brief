import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";

import { BetaOnboardingAgentExperience } from "@/components/marketing/BetaOnboardingAgentExperience";

/**
 * Replaces the legacy static beta application form inside Landing.tsx without
 * rewriting the large landing page file. All existing CTAs still scroll to
 * #apply; visitors see the live onboarding agent instead of the old form.
 */
export function LandingBetaAgentMount() {
  const location = useLocation();
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (location.pathname !== "/") {
      setTarget(null);
      return;
    }

    const applySection = document.getElementById("apply");
    if (!applySection) return;

    const hiddenChildren = Array.from(applySection.children).filter(
      (child) => !(child as HTMLElement).dataset.pbAgentMount,
    ) as HTMLElement[];

    hiddenChildren.forEach((child) => {
      child.dataset.pbOriginalDisplay = child.style.display;
      child.style.display = "none";
    });

    setTarget(applySection);

    return () => {
      hiddenChildren.forEach((child) => {
        child.style.display = child.dataset.pbOriginalDisplay ?? "";
        delete child.dataset.pbOriginalDisplay;
      });
      setTarget(null);
    };
  }, [location.pathname]);

  if (!target) return null;

  return createPortal(
    <div data-pb-agent-mount="true" className="pb-container relative z-10">
      <BetaOnboardingAgentExperience source="landing-agent-application" />
    </div>,
    target,
  );
}
