import { Card, Grid } from "@/design-system/schema";
import { RiseIn } from "@/components/motion/RiseIn";
import { CfImg } from "@/components/shared/CfImg";

interface PhotoItem {
  src: string;
  alt: string;
  caption: string;
  width?: number;
  height?: number;
}

interface PublicPhotoPairProps {
  items: [PhotoItem, PhotoItem];
  className?: string;
}

export function PublicPhotoPair({ items, className }: PublicPhotoPairProps) {
  return (
    <div className={className}>
      <Grid cols={2} gap="md">
        {items.map((item, index) => (
          <RiseIn key={item.alt} delay={index * 0.06}>
            <Card padding="none">
              <div className="overflow-hidden border-b border-border bg-muted">
                <CfImg
                  src={item.src}
                  alt={item.alt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  cfWidth={item.width ?? 1536}
                  width={item.width ?? 1536}
                  height={item.height ?? 1024}
                />
              </div>
              <div className="p-4 sm:p-5">
                <p className="font-mono text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[hsl(var(--accent-kinetic))]">
                  [ Photo {String(index + 1).padStart(2, "0")} ]
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.caption}</p>
              </div>
            </Card>
          </RiseIn>
        ))}
      </Grid>
    </div>
  );
}
