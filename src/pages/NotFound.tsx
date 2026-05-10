import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Section, Container } from "@/design-system/schema";

const NotFound = () => (
  <div className="relative min-h-screen overflow-hidden bg-background">
    <div
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[60vh] bg-ambient-sky"
      aria-hidden
    />
    <Section size="tight">
      <Container width="reading">
        <div className="text-center">
          <p className="inline-flex items-baseline gap-2 font-mono text-[0.7rem] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="inline-block h-px w-8 -translate-y-[0.25em] bg-[hsl(var(--accent-kinetic))]" />
            <span className="text-[hsl(var(--accent-kinetic))]">[ 404 ]</span>
            <span>Not found</span>
          </p>
          <h1 className="mt-5 text-[clamp(2.5rem,6vw,4rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-foreground">
            Page not found.
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            The page you're looking for doesn't exist.
          </p>
          <Button asChild className="mt-8 rounded-[0.25rem]">
            <NavLink to="/">Back home</NavLink>
          </Button>
        </div>
      </Container>
    </Section>
  </div>
);

export default NotFound;
