import { Section, Container } from "@/design-system/schema";

export interface LegalSection {
  title: string;
  body: string[];
}

interface LegalPageProps {
  title: string;
  updatedAt: string;
  sections: LegalSection[];
}

/**
 * Plain, readable legal document shell. No decorative panels, no numeral chrome.
 * The text is what matters.
 */
export function LegalPage({ title, updatedAt, sections }: LegalPageProps) {
  return (
    <Section>
      <Container width="narrow">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: {updatedAt}</p>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-muted-foreground sm:text-base">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 text-sm text-muted-foreground">
          Questions:{" "}
          <a className="font-medium text-foreground underline-offset-4 hover:underline" href="mailto:hello@photobrief.ai">
            hello@photobrief.ai
          </a>
          .
        </p>
      </Container>
    </Section>
  );
}
