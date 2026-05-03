import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

import { AmbientBackground } from "./components/AmbientBackground";
import {
  BigTitle,
  BodyCopy,
  FlowPill,
  GlassCard,
  Kicker,
  LogoLockup,
  gradientTextStyle,
  useEntrance,
} from "./components/SpotlightPrimitives";
import { COLORS, FONT, GRADIENT_DARK, GRADIENT_PRIMARY, SHADOW, SPRING } from "./theme";

loadFont("normal", { weights: ["400", "500", "600", "700", "800"], subsets: ["latin"] });

const FPS = 30;
const D_INTRO = 150;
const D_PROBLEM = 210;
const D_INTAKE = 270;
const D_ROUTING = 240;
const D_CAPTURE = 330;
const D_AI = 240;
const D_BRIEF = 300;
const D_CLOSING = 270;

export const TOTAL_FRAMES = D_INTRO + D_PROBLEM + D_INTAKE + D_ROUTING + D_CAPTURE + D_AI + D_BRIEF + D_CLOSING;

function sceneOpacity(frame: number, duration: number, inFrames = 24, outFrames = 24) {
  const fadeIn = interpolate(frame, [0, inFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [duration - outFrames, duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return Math.min(fadeIn, fadeOut);
}

const SceneShell: React.FC<{ duration: number; dark?: boolean; children: React.ReactNode }> = ({ duration, dark, children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: sceneOpacity(frame, duration),
        background: dark ? GRADIENT_DARK : "transparent",
        overflow: "hidden",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <AmbientBackground />
      <Sequence from={0} durationInFrames={D_INTRO}>
        <SceneIntro duration={D_INTRO} />
      </Sequence>
      <Sequence from={D_INTRO} durationInFrames={D_PROBLEM}>
        <SceneProblem duration={D_PROBLEM} />
      </Sequence>
      <Sequence from={D_INTRO + D_PROBLEM} durationInFrames={D_INTAKE}>
        <SceneWebsiteIntake duration={D_INTAKE} />
      </Sequence>
      <Sequence from={D_INTRO + D_PROBLEM + D_INTAKE} durationInFrames={D_ROUTING}>
        <SceneRouting duration={D_ROUTING} />
      </Sequence>
      <Sequence from={D_INTRO + D_PROBLEM + D_INTAKE + D_ROUTING} durationInFrames={D_CAPTURE}>
        <SceneCapture duration={D_CAPTURE} />
      </Sequence>
      <Sequence from={D_INTRO + D_PROBLEM + D_INTAKE + D_ROUTING + D_CAPTURE} durationInFrames={D_AI}>
        <SceneAiChecks duration={D_AI} />
      </Sequence>
      <Sequence from={D_INTRO + D_PROBLEM + D_INTAKE + D_ROUTING + D_CAPTURE + D_AI} durationInFrames={D_BRIEF}>
        <SceneBrief duration={D_BRIEF} />
      </Sequence>
      <Sequence from={D_INTRO + D_PROBLEM + D_INTAKE + D_ROUTING + D_CAPTURE + D_AI + D_BRIEF} durationInFrames={D_CLOSING}>
        <SceneClosingSpotlight duration={D_CLOSING} />
      </Sequence>
    </AbsoluteFill>
  );
};

function SceneIntro({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logo = spring({ frame: frame - 8, fps, config: SPRING.cinematic });
  const glow = interpolate(frame, [0, duration], [0, 1]);
  return (
    <SceneShell duration={duration} dark>
      <div style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", width: 920, height: 920, borderRadius: 999, left: -260, top: -280, background: `radial-gradient(circle, ${COLORS.primary}55, transparent 68%)`, filter: "blur(44px)", opacity: 0.85 + glow * 0.1 }} />
        <div style={{ position: "absolute", width: 760, height: 760, borderRadius: 999, right: -220, bottom: -260, background: `radial-gradient(circle, ${COLORS.cyan}33, transparent 70%)`, filter: "blur(50px)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)", backgroundSize: "54px 54px", maskImage: "radial-gradient(circle at 50% 45%, black, transparent 72%)" }} />
      </div>
      <div style={{ position: "absolute", left: 130, top: 132, ...useEntrance(4, 18) }}>
        <LogoLockup light height={74} />
      </div>
      <div style={{ position: "absolute", left: 130, top: 300, ...useEntrance(18, 34) }}>
        <Kicker tone="dark">Product spotlight</Kicker>
        <BigTitle tone="dark" maxWidth={1060}>
          Website leads become <span style={gradientTextStyle()}>photo-ready briefs.</span>
        </BigTitle>
        <BodyCopy tone="dark" maxWidth={770}>
          The visual intake layer for small businesses that need the right customer photos before they quote, dispatch, approve, or document work.
        </BodyCopy>
      </div>
      <GlassCard
        dark
        style={{
          position: "absolute",
          right: 140,
          bottom: 125,
          width: 490,
          padding: 26,
          transform: `translateY(${interpolate(logo, [0, 1], [36, 0])}px) scale(${interpolate(logo, [0, 1], [0.96, 1])})`,
          opacity: interpolate(logo, [0, 1], [0, 1]),
        }}
      >
        <FlowMini dark />
      </GlassCard>
    </SceneShell>
  );
}

function SceneProblem({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const cards = [
    { from: "Customer", text: "Hi, can I get a quote?" },
    { from: "Business", text: "Sure — can you send a few photos?" },
    { from: "Customer", text: "Which photos?" },
    { from: "Business", text: "Actually, can you retake that label?" },
  ];
  return (
    <SceneShell duration={duration}>
      <div style={{ position: "absolute", left: 125, top: 160, ...useEntrance(6, 24) }}>
        <Kicker>Before PhotoBrief</Kicker>
        <BigTitle maxWidth={830}>The contact form is not the intake.</BigTitle>
        <BodyCopy maxWidth={710}>Most small-business leads turn into messy email threads, vague photos, and slow decisions.</BodyCopy>
      </div>
      <div style={{ position: "absolute", right: 150, top: 150, width: 640, height: 690 }}>
        {cards.map((card, i) => {
          const s = spring({ frame: frame - 24 - i * 28, fps: FPS, config: SPRING.cinematic });
          const left = i % 2 === 0;
          return (
            <GlassCard
              key={card.text}
              style={{
                position: "absolute",
                width: left ? 470 : 520,
                left: left ? 0 : 92,
                top: i * 130,
                padding: 24,
                opacity: interpolate(s, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(s, [0, 1], [38, 0])}px)`,
                boxShadow: i === 3 ? "0 24px 60px rgba(239, 68, 68, 0.16)" : SHADOW.soft,
              }}
            >
              <div style={{ fontFamily: FONT.body, fontSize: 15, fontWeight: 700, color: left ? COLORS.primary : COLORS.muted, marginBottom: 8 }}>{card.from}</div>
              <div style={{ fontFamily: FONT.body, fontSize: 28, lineHeight: 1.22, fontWeight: 650, color: COLORS.foreground }}>{card.text}</div>
            </GlassCard>
          );
        })}
        <div
          style={{
            position: "absolute",
            right: 14,
            bottom: 20,
            padding: "14px 18px",
            borderRadius: 999,
            background: COLORS.destructiveLight,
            color: COLORS.destructive,
            fontFamily: FONT.body,
            fontSize: 18,
            fontWeight: 800,
            opacity: interpolate(frame, [140, 178], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}
        >
          Too much back-and-forth
        </div>
      </div>
    </SceneShell>
  );
}

function SceneWebsiteIntake({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration} dark>
      <div style={{ position: "absolute", left: 118, top: 132, ...useEntrance(4, 20) }}>
        <Kicker tone="dark">Website Intake</Kicker>
        <BigTitle tone="dark" maxWidth={780}>One better button on your website.</BigTitle>
        <BodyCopy tone="dark" maxWidth={680}>A hosted intake link or webhook turns the first customer request into a real PhotoBrief workflow.</BodyCopy>
        <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap", maxWidth: 760 }}>
          <FlowPill dark label="Hosted form" active delay={34} />
          <FlowPill dark label="Existing webhook" delay={46} />
          <FlowPill dark label="Customer profile" delay={58} />
        </div>
      </div>
      <div style={{ position: "absolute", right: 120, top: 118, width: 760, height: 790 }}>
        <BrowserLeadCard frame={frame} />
      </div>
    </SceneShell>
  );
}

function SceneRouting({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const routeProgress = interpolate(frame, [40, 190], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <SceneShell duration={duration}>
      <div style={{ position: "absolute", left: 120, top: 150, ...useEntrance(4, 20) }}>
        <Kicker>Template routing</Kicker>
        <BigTitle maxWidth={880}>Every lead gets the right photo request.</BigTitle>
        <BodyCopy maxWidth={720}>Rules first. AI fallback second. Default template last. Automation stays useful without getting weird.</BodyCopy>
      </div>
      <GlassCard style={{ position: "absolute", right: 116, top: 150, width: 690, padding: 34 }}>
        <div style={{ fontFamily: FONT.body, fontSize: 18, fontWeight: 800, color: COLORS.foreground, marginBottom: 24 }}>Routing rules</div>
        {[
          ["contains", "repair", "Repair intake"],
          ["contains", "quote", "Quote photos"],
          ["fallback", "anything else", "General service intake"],
        ].map((row, i) => {
          const active = routeProgress > i * 0.27;
          return (
            <div key={row[2]} style={{ display: "grid", gridTemplateColumns: "130px 1fr 210px", alignItems: "center", gap: 14, marginBottom: 16, opacity: active ? 1 : 0.32 }}>
              <span style={{ borderRadius: 999, padding: "8px 12px", background: active ? COLORS.primaryLight : COLORS.borderLight, color: active ? COLORS.primary : COLORS.muted, fontSize: 16, fontWeight: 750, textAlign: "center" }}>{row[0]}</span>
              <span style={{ borderRadius: 18, padding: "15px 18px", background: "rgba(255,255,255,0.84)", border: `1px solid ${COLORS.border}`, fontSize: 20, fontWeight: 700, color: COLORS.foreground }}>“{row[1]}”</span>
              <span style={{ borderRadius: 18, padding: "15px 18px", background: active ? GRADIENT_PRIMARY : COLORS.borderLight, color: active ? COLORS.white : COLORS.muted, fontSize: 20, fontWeight: 800 }}>{row[2]}</span>
            </div>
          );
        })}
        <div style={{ marginTop: 26, borderRadius: 24, padding: 22, background: "linear-gradient(135deg, rgba(11,103,255,0.10), rgba(24,212,255,0.12))", border: `1px solid ${COLORS.border}` }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.primary }}>AI fallback</div>
          <div style={{ marginTop: 6, fontSize: 16, lineHeight: 1.45, color: COLORS.muted }}>Only chooses from your configured templates when the match is confident.</div>
        </div>
      </GlassCard>
    </SceneShell>
  );
}

function SceneCapture({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const step = Math.min(3, Math.floor(interpolate(frame, [60, 260], [0, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
  return (
    <SceneShell duration={duration}>
      <div style={{ position: "absolute", left: 116, top: 145, ...useEntrance(4, 20) }}>
        <Kicker>Customer capture</Kicker>
        <BigTitle maxWidth={760}>A phone-first flow anyone can finish fast.</BigTitle>
        <BodyCopy maxWidth={660}>No account. No app. One photo at a time, with simple guidance that keeps customers moving.</BodyCopy>
        <div style={{ display: "flex", gap: 12, marginTop: 34, flexWrap: "wrap", maxWidth: 680 }}>
          <FlowPill label="Open link" active={step >= 0} delay={40} />
          <FlowPill label="Take photo" active={step >= 1} delay={56} />
          <FlowPill label="Review" active={step >= 2} delay={72} />
          <FlowPill label="Send" active={step >= 3} delay={88} />
        </div>
      </div>
      <div style={{ position: "absolute", right: 250, top: 84 }}>
        <PhoneCapture frame={frame} step={step} />
      </div>
      <div style={{ position: "absolute", right: 104, top: 200 }}>
        <PhotoStack frame={frame} />
      </div>
    </SceneShell>
  );
}

function SceneAiChecks({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const checks = [
    { label: "Requested subject visible", status: "Looks good", color: COLORS.success },
    { label: "Readable label/text", status: "Usable", color: COLORS.warning },
    { label: "Blur / low light / glare", status: "Simple advice", color: COLORS.primary },
  ];
  return (
    <SceneShell duration={duration} dark>
      <div style={{ position: "absolute", left: 120, top: 145, ...useEntrance(4, 20) }}>
        <Kicker tone="dark">AI photo checks</Kicker>
        <BigTitle tone="dark" maxWidth={820}>Useful feedback, not a lecture.</BigTitle>
        <BodyCopy tone="dark" maxWidth={700}>PhotoBrief checks for simple issues: wrong subject, too dark, blurry, unreadable label, glare, or cropped subject.</BodyCopy>
      </div>
      <GlassCard dark style={{ position: "absolute", right: 142, top: 145, width: 640, padding: 30 }}>
        <div style={{ display: "grid", gridTemplateColumns: "190px 1fr", gap: 24, alignItems: "center" }}>
          <div style={{ borderRadius: 28, overflow: "hidden", border: "1px solid rgba(255,255,255,0.13)", height: 280 }}>
            <Img src={staticFile("photos/pile-closeup.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.5, color: COLORS.cyan, marginBottom: 18 }}>Photo assessment</div>
            {checks.map((check, i) => {
              const s = spring({ frame: frame - 36 - i * 28, fps: FPS, config: SPRING.snap });
              return (
                <div key={check.label} style={{ opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateX(${interpolate(s, [0, 1], [28, 0])}px)`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, borderRadius: 18, padding: "15px 16px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", marginBottom: 12 }}>
                  <span style={{ color: "rgba(255,255,255,0.82)", fontSize: 18, fontWeight: 650 }}>{check.label}</span>
                  <span style={{ borderRadius: 999, padding: "8px 12px", background: `${check.color}22`, color: check.color, fontSize: 14, fontWeight: 850 }}>{check.status}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ marginTop: 24, borderRadius: 24, padding: 20, background: "rgba(255,255,255,0.07)", color: COLORS.white, fontSize: 24, fontWeight: 780 }}>
          “Looks good — this photo should work well.”
        </div>
      </GlassCard>
    </SceneShell>
  );
}

function SceneBrief({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  return (
    <SceneShell duration={duration}>
      <div style={{ position: "absolute", left: 116, top: 135, ...useEntrance(4, 20) }}>
        <Kicker>Business brief</Kicker>
        <BigTitle maxWidth={820}>Everything your team needs to act.</BigTitle>
        <BodyCopy maxWidth={660}>Photos, customer answers, AI notes, and a plain-English summary arrive organized in one place.</BodyCopy>
      </div>
      <GlassCard style={{ position: "absolute", right: 92, top: 88, width: 860, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 30, fontWeight: 800, color: COLORS.foreground }}>Garage cleanout quote</div>
            <div style={{ fontSize: 17, color: COLORS.muted, marginTop: 4 }}>Marcus T. · Website Intake · Ready to quote</div>
          </div>
          <div style={{ borderRadius: 999, padding: "11px 16px", background: COLORS.successLight, color: COLORS.success, fontSize: 15, fontWeight: 850 }}>Complete</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {["wide-garage.jpg", "pile-closeup.jpg", "appliances.jpg", "driveway-access.jpg"].map((img, i) => {
            const s = spring({ frame: frame - 36 - i * 16, fps: FPS, config: SPRING.cinematic });
            return (
              <div key={img} style={{ opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateY(${interpolate(s, [0, 1], [22, 0])}px)`, height: 170, borderRadius: 24, overflow: "hidden", position: "relative" }}>
                <Img src={staticFile(`photos/${img}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", right: 12, top: 12, borderRadius: 999, padding: "6px 10px", background: "rgba(21,128,79,0.92)", color: COLORS.white, fontSize: 13, fontWeight: 850 }}>✓</div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 16, marginTop: 18 }}>
          <div style={{ borderRadius: 28, padding: 22, background: "rgba(11,103,255,0.07)", border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 15, fontWeight: 850, textTransform: "uppercase", letterSpacing: 1.2, color: COLORS.primary }}>Summary</div>
            <div style={{ marginTop: 10, fontSize: 24, lineHeight: 1.28, fontWeight: 680, color: COLORS.foreground }}>Single-car garage cleanout, about half truckload. Ground-level access. Appliance handling needed.</div>
          </div>
          <div style={{ borderRadius: 28, padding: 22, background: COLORS.bgCardSolid, border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 15, fontWeight: 850, textTransform: "uppercase", letterSpacing: 1.2, color: COLORS.muted }}>Next action</div>
            <div style={{ marginTop: 12, fontSize: 24, lineHeight: 1.2, fontWeight: 800, color: COLORS.foreground }}>Send quote</div>
            <div style={{ marginTop: 18, borderRadius: 18, padding: "14px 16px", background: GRADIENT_PRIMARY, color: COLORS.white, fontSize: 18, fontWeight: 850, textAlign: "center" }}>Review brief</div>
          </div>
        </div>
      </GlassCard>
    </SceneShell>
  );
}

function SceneClosingSpotlight({ duration }: { duration: number }) {
  return (
    <SceneShell duration={duration} dark>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)", backgroundSize: "54px 54px", maskImage: "radial-gradient(circle at 50% 45%, black, transparent 72%)" }} />
      <div style={{ position: "absolute", left: 150, top: 120, ...useEntrance(4, 18) }}>
        <LogoLockup light height={72} />
      </div>
      <div style={{ position: "absolute", left: 150, top: 300, ...useEntrance(18, 28) }}>
        <Kicker tone="dark">The new intake layer</Kicker>
        <BigTitle tone="dark" maxWidth={1030}>Turn the first contact into the right photos.</BigTitle>
        <BodyCopy tone="dark" maxWidth={760}>PhotoBrief gives small businesses a cleaner way to collect, check, and act on customer photos.</BodyCopy>
        <div style={{ marginTop: 42, display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ borderRadius: 999, padding: "18px 26px", background: GRADIENT_PRIMARY, color: COLORS.white, fontFamily: FONT.body, fontSize: 22, fontWeight: 850, boxShadow: SHADOW.glow }}>Start with Website Intake</div>
          <div style={{ color: "rgba(255,255,255,0.62)", fontFamily: FONT.body, fontSize: 18, fontWeight: 650 }}>photobrief.ai</div>
        </div>
      </div>
      <GlassCard dark style={{ position: "absolute", right: 135, bottom: 122, width: 520, padding: 26 }}>
        <FlowMini dark />
      </GlassCard>
    </SceneShell>
  );
}

function FlowMini({ dark }: { dark?: boolean }) {
  const items = ["Website lead", "Template", "Mobile photos", "Job brief"];
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.map((item, i) => (
        <div key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 12, background: i === 0 ? GRADIENT_PRIMARY : dark ? "rgba(255,255,255,0.08)" : COLORS.primaryLight, color: i === 0 ? COLORS.white : COLORS.primary, display: "grid", placeItems: "center", fontSize: 15, fontWeight: 850 }}>{i + 1}</div>
          <div style={{ color: dark ? COLORS.white : COLORS.foreground, fontFamily: FONT.body, fontSize: 19, fontWeight: 760 }}>{item}</div>
        </div>
      ))}
    </div>
  );
}

function BrowserLeadCard({ frame }: { frame: number }) {
  const submit = interpolate(frame, [118, 170], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <GlassCard dark style={{ width: "100%", height: "100%", padding: 24 }}>
      <div style={{ height: 54, display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.62)", fontSize: 16, fontFamily: FONT.body }}>
        <span style={{ width: 11, height: 11, borderRadius: 999, background: "#FF5F57" }} />
        <span style={{ width: 11, height: 11, borderRadius: 999, background: "#FFBD2E" }} />
        <span style={{ width: 11, height: 11, borderRadius: 999, background: "#28C840" }} />
        <span style={{ marginLeft: 18 }}>apexservices.com/get-a-quote</span>
      </div>
      <div style={{ padding: 34 }}>
        <div style={{ fontFamily: FONT.display, fontSize: 42, lineHeight: 1.05, fontWeight: 780, color: COLORS.white }}>Request service</div>
        <div style={{ marginTop: 12, fontFamily: FONT.body, fontSize: 20, color: "rgba(255,255,255,0.64)" }}>Tell us what you need. We’ll collect the right photos next.</div>
        <div style={{ display: "grid", gap: 14, marginTop: 32 }}>
          {[
            ["Name", "Marcus T."],
            ["Request type", "Garage cleanout quote"],
            ["Message", "Need junk removed this week."],
          ].map(([label, value], i) => (
            <div key={label} style={{ opacity: interpolate(frame, [24 + i * 16, 54 + i * 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), borderRadius: 20, padding: "16px 18px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.10)" }}>
              <div style={{ fontSize: 13, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.4, color: COLORS.cyan }}>{label}</div>
              <div style={{ marginTop: 5, fontSize: 23, fontWeight: 700, color: COLORS.white }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 28, borderRadius: 22, padding: "17px 20px", background: GRADIENT_PRIMARY, color: COLORS.white, fontSize: 22, fontWeight: 850, textAlign: "center", transform: `scale(${1 + submit * 0.015})`, boxShadow: submit ? SHADOW.glow : "none" }}>Start request</div>
        {submit > 0.45 ? (
          <div style={{ marginTop: 20, borderRadius: 999, padding: "12px 16px", background: "rgba(21,128,79,0.18)", color: COLORS.success, fontSize: 18, fontWeight: 850, textAlign: "center" }}>✓ Lead received by PhotoBrief</div>
        ) : null}
      </div>
    </GlassCard>
  );
}

function PhoneCapture({ frame, step }: { frame: number; step: number }) {
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - 12, fps, config: SPRING.cinematic });
  const photos = ["wide-garage.jpg", "pile-closeup.jpg", "appliances.jpg", "driveway-access.jpg"];
  const labels = ["Full area", "Main pile close-up", "Appliances", "Access path"];
  return (
    <div style={{ transform: `translateY(${interpolate(s, [0, 1], [80, 0])}px) rotate(${interpolate(s, [0, 1], [4, -1.5])}deg)`, opacity: interpolate(s, [0, 1], [0, 1]) }}>
      <div style={{ width: 390, height: 780, borderRadius: 54, background: COLORS.ink, padding: 10, boxShadow: "0 48px 110px rgba(6,19,38,0.30)" }}>
        <div style={{ width: "100%", height: "100%", borderRadius: 44, overflow: "hidden", background: COLORS.bgCardSolid, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "24px 24px 18px", borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.muted }}>Apex Services</div>
            <div style={{ marginTop: 4, fontSize: 22, fontWeight: 850, color: COLORS.foreground }}>Send {labels[step]}</div>
            <div style={{ marginTop: 14, height: 7, borderRadius: 999, background: COLORS.borderLight, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(step + 1) * 25}%`, borderRadius: 999, background: GRADIENT_PRIMARY }} />
            </div>
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            <Img src={staticFile(`photos/${photos[step]}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", left: 18, right: 18, bottom: 18, borderRadius: 24, padding: 18, background: "rgba(6,19,38,0.72)", color: COLORS.white, fontSize: 18, lineHeight: 1.3, fontWeight: 700 }}>Stand back enough to show what matters.</div>
          </div>
          <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
            <div style={{ borderRadius: 22, padding: "17px 20px", background: GRADIENT_PRIMARY, color: COLORS.white, textAlign: "center", fontSize: 20, fontWeight: 850 }}>Take photo</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhotoStack({ frame }: { frame: number }) {
  return (
    <div style={{ position: "relative", width: 360, height: 520 }}>
      {["wide-garage.jpg", "pile-closeup.jpg", "driveway-access.jpg"].map((img, i) => {
        const s = spring({ frame: frame - 94 - i * 36, fps: FPS, config: SPRING.bouncy });
        return (
          <div key={img} style={{ position: "absolute", top: i * 112, left: i * -28, width: 260, height: 176, borderRadius: 28, overflow: "hidden", border: `6px solid ${COLORS.white}`, boxShadow: SHADOW.strong, opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateY(${interpolate(s, [0, 1], [40, 0])}px) rotate(${[-4, 5, -2][i]}deg)` }}>
            <Img src={staticFile(`photos/${img}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        );
      })}
    </div>
  );
}
