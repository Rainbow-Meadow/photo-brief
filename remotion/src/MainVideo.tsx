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

// Scene durations — ~90 seconds total
const D_HOOK = 100;           // ~3.3s — pain point
const D_VALUEPROP = 90;       // 3s — logo + one-liner
const D_CREATE = 360;         // 12s — create request demo
const D_CAPTURE = 420;        // 14s — customer phone capture
const D_BRIEF = 420;          // 14s — completed brief
const D_BETA_TRANSITION = 110; // ~3.7s — tone shift
const D_PARTNER_BENEFITS = 360; // 12s — what partners get
const D_REWARD_TIERS = 360;   // 12s — reward tiers
const D_CLOSING = 480;        // 16s — CTA

export const TOTAL_FRAMES =
  D_HOOK + D_VALUEPROP + D_CREATE + D_CAPTURE + D_BRIEF +
  D_BETA_TRANSITION + D_PARTNER_BENEFITS + D_REWARD_TIERS + D_CLOSING;

/* ── Shared helpers ─────────────────────────────────────── */

function sceneOpacity(frame: number, duration: number, inF = 20, outF = 20) {
  const fadeIn = interpolate(frame, [0, inF], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [duration - outF, duration], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return Math.min(fadeIn, fadeOut);
}

const Shell: React.FC<{ duration: number; dark?: boolean; children: React.ReactNode }> = ({ duration, dark, children }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: sceneOpacity(frame, duration), background: dark ? GRADIENT_DARK : "transparent", overflow: "hidden" }}>
      {children}
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ children: React.ReactNode; delay?: number; dark?: boolean }> = ({ children, delay = 0, dark }) => {
  const entrance = useEntrance(delay, 16);
  return (
    <div style={{
      ...entrance,
      position: "absolute",
      left: 0, right: 0, bottom: 72,
      textAlign: "center",
    }}>
      <span style={{
        display: "inline-block",
        padding: "16px 32px",
        borderRadius: 999,
        background: dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)",
        border: dark ? "1px solid rgba(255,255,255,0.14)" : `1px solid ${COLORS.border}`,
        fontFamily: FONT.body,
        fontSize: 22,
        fontWeight: 700,
        color: dark ? "rgba(255,255,255,0.82)" : COLORS.foreground,
        letterSpacing: -0.3,
      }}>
        {children}
      </span>
    </div>
  );
};

/* ── Scene 1: Hook — Pain Point ────────────────────────── */

function SceneHook({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const line1 = "Your customers have the photos you need.";
  const line2 = "They just don't know which ones.";

  const s1 = spring({ frame: frame - 6, fps, config: SPRING.cinematic });
  const s2 = spring({ frame: frame - 30, fps, config: SPRING.cinematic });

  return (
    <Shell duration={duration} dark>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(circle at 50% 50%, black, transparent 72%)" }} />
      <div style={{ position: "absolute", width: 900, height: 900, borderRadius: 999, left: "50%", top: "50%", marginLeft: -450, marginTop: -450, background: `radial-gradient(circle, ${COLORS.primary}44, transparent 68%)`, filter: "blur(60px)" }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80 }}>
        <div style={{
          fontFamily: FONT.display,
          fontSize: 78,
          lineHeight: 1.0,
          letterSpacing: -4,
          fontWeight: 780,
          color: COLORS.white,
          textAlign: "center",
          maxWidth: 1100,
          opacity: interpolate(s1, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(s1, [0, 1], [30, 0])}px)`,
        }}>
          {line1}
        </div>
        <div style={{
          fontFamily: FONT.display,
          fontSize: 78,
          lineHeight: 1.0,
          letterSpacing: -4,
          fontWeight: 780,
          textAlign: "center",
          maxWidth: 1100,
          marginTop: 12,
          opacity: interpolate(s2, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(s2, [0, 1], [30, 0])}px)`,
          ...gradientTextStyle(),
        }}>
          {line2}
        </div>
      </div>
    </Shell>
  );
}

/* ── Scene 2: Logo + Value Prop ────────────────────────── */

function SceneValueProp({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoS = spring({ frame: frame - 4, fps, config: SPRING.cinematic });
  const textS = spring({ frame: frame - 18, fps, config: SPRING.cinematic });

  return (
    <Shell duration={duration} dark>
      <div style={{ position: "absolute", width: 700, height: 700, borderRadius: 999, left: "50%", top: "50%", marginLeft: -350, marginTop: -350, background: `radial-gradient(circle, ${COLORS.primary}33, transparent 70%)`, filter: "blur(50px)" }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 32 }}>
        <div style={{ opacity: interpolate(logoS, [0, 1], [0, 1]), transform: `scale(${interpolate(logoS, [0, 1], [0.9, 1])})` }}>
          <LogoLockup light height={80} />
        </div>
        <div style={{
          fontFamily: FONT.body,
          fontSize: 32,
          fontWeight: 650,
          color: "rgba(255,255,255,0.72)",
          textAlign: "center",
          maxWidth: 700,
          opacity: interpolate(textS, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(textS, [0, 1], [18, 0])}px)`,
        }}>
          Tells them exactly what to send.
        </div>
      </div>
    </Shell>
  );
}

/* ── Scene 3: Create Request (Dashboard Demo) ──────────── */

function SceneCreateRequest({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fields = [
    { label: "Customer", value: "Sarah Mitchell" },
    { label: "Email", value: "sarah.m@example.com" },
    { label: "Template", value: "Roof Inspection" },
  ];

  const typeChar = (text: string, startFrame: number, rate = 0.55) => {
    const elapsed = Math.max(0, frame - startFrame);
    return text.substring(0, Math.min(text.length, Math.floor(elapsed * rate)));
  };

  const sendProgress = interpolate(frame, [240, 260], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const showSuccess = frame > 270;
  const successS = spring({ frame: frame - 270, fps, config: SPRING.snap });

  return (
    <Shell duration={duration}>
      <AmbientBackground />
      <div style={{ position: "absolute", left: 120, top: 160, ...useEntrance(4, 20) }}>
        <Kicker>Step 1</Kicker>
        <BigTitle maxWidth={660}>Create a photo request in seconds.</BigTitle>
      </div>

      <GlassCard style={{ position: "absolute", right: 110, top: 110, width: 720, padding: 32 }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: COLORS.foreground, fontFamily: FONT.display, marginBottom: 6 }}>New photo request</div>
        <div style={{ fontSize: 16, color: COLORS.muted, marginBottom: 28 }}>Your customer gets a simple link — no app needed.</div>

        {fields.map((field, i) => {
          const fieldS = spring({ frame: frame - 20 - i * 24, fps, config: SPRING.snap });
          const typed = typeChar(field.value, 60 + i * 40);
          return (
            <div key={field.label} style={{
              opacity: interpolate(fieldS, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(fieldS, [0, 1], [14, 0])}px)`,
              marginBottom: 16,
              borderRadius: 20,
              padding: "16px 20px",
              background: COLORS.bgCardSolid,
              border: `1px solid ${COLORS.border}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.4, color: COLORS.primary, marginBottom: 4 }}>{field.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.foreground, fontFamily: FONT.body, minHeight: 28 }}>
                {typed}
                {typed.length < field.value.length && <span style={{ opacity: frame % 16 < 8 ? 1 : 0, color: COLORS.primary }}>|</span>}
              </div>
            </div>
          );
        })}

        <div style={{
          marginTop: 12,
          borderRadius: 22,
          padding: "18px 20px",
          background: GRADIENT_PRIMARY,
          color: COLORS.white,
          fontSize: 21,
          fontWeight: 850,
          textAlign: "center",
          transform: `scale(${sendProgress > 0 ? 0.96 + sendProgress * 0.04 : 1})`,
          boxShadow: sendProgress > 0.5 ? SHADOW.glow : "none",
        }}>
          Send request
        </div>

        {showSuccess && (
          <div style={{
            marginTop: 16,
            borderRadius: 999,
            padding: "12px 18px",
            background: COLORS.successLight,
            color: COLORS.success,
            fontSize: 18,
            fontWeight: 850,
            textAlign: "center",
            opacity: interpolate(successS, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(successS, [0, 1], [12, 0])}px)`,
          }}>
            ✓ Request sent to Sarah
          </div>
        )}
      </GlassCard>

      <Caption delay={80}>Pick a template. Add their name. Hit send.</Caption>
    </Shell>
  );
}

/* ── Scene 4: Customer Capture (Phone Demo) ────────────── */

function SceneCustomerCapture({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const photos = ["wide-garage.jpg", "pile-closeup.jpg", "appliances.jpg", "driveway-access.jpg"];
  const labels = ["Full area", "Main pile", "Appliances", "Access path"];
  const step = Math.min(3, Math.floor(interpolate(frame, [60, 320], [0, 4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));

  const phoneS = spring({ frame: frame - 8, fps, config: SPRING.cinematic });

  return (
    <Shell duration={duration}>
      <AmbientBackground />
      <div style={{ position: "absolute", left: 120, top: 160, ...useEntrance(4, 20) }}>
        <Kicker>Step 2</Kicker>
        <BigTitle maxWidth={680}>Your customer opens a link and takes photos.</BigTitle>
        <BodyCopy maxWidth={560}>No app. No account. One photo at a time, with guidance that keeps them moving.</BodyCopy>

        <div style={{ display: "flex", gap: 12, marginTop: 36, flexWrap: "wrap", maxWidth: 620 }}>
          {labels.map((label, i) => (
            <FlowPill key={label} label={label} active={step >= i} delay={40 + i * 16} />
          ))}
        </div>
      </div>

      <div style={{
        position: "absolute",
        right: 260,
        top: 60,
        transform: `translateY(${interpolate(phoneS, [0, 1], [60, 0])}px) rotate(${interpolate(phoneS, [0, 1], [3, -1])}deg)`,
        opacity: interpolate(phoneS, [0, 1], [0, 1]),
      }}>
        <div style={{ width: 390, height: 780, borderRadius: 54, background: COLORS.ink, padding: 10, boxShadow: "0 48px 110px rgba(6,19,38,0.30)" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 44, overflow: "hidden", background: COLORS.bgCardSolid, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "24px 24px 18px", borderBottom: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.muted }}>Apex Services</div>
              <div style={{ marginTop: 4, fontSize: 22, fontWeight: 850, color: COLORS.foreground }}>Send {labels[step]}</div>
              <div style={{ marginTop: 14, height: 7, borderRadius: 999, background: COLORS.borderLight, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(step + 1) * 25}%`, borderRadius: 999, background: GRADIENT_PRIMARY, transition: "none" }} />
              </div>
            </div>
            <div style={{ flex: 1, position: "relative" }}>
              <Img src={staticFile(`photos/${photos[step]}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", left: 18, right: 18, bottom: 18, borderRadius: 24, padding: 18, background: "rgba(6,19,38,0.72)", color: COLORS.white, fontSize: 18, lineHeight: 1.3, fontWeight: 700 }}>
                Stand back enough to show what matters.
              </div>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ borderRadius: 22, padding: "17px 20px", background: GRADIENT_PRIMARY, color: COLORS.white, textAlign: "center", fontSize: 20, fontWeight: 850 }}>Take photo</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", right: 80, top: 200 }}>
        {photos.slice(0, Math.min(step + 1, 3)).map((img, i) => {
          const s = spring({ frame: frame - 90 - i * 60, fps, config: SPRING.snap });
          return (
            <div key={img} style={{
              position: "absolute",
              top: i * 105,
              left: i * -20,
              width: 200,
              height: 140,
              borderRadius: 22,
              overflow: "hidden",
              border: `5px solid ${COLORS.white}`,
              boxShadow: SHADOW.strong,
              opacity: interpolate(s, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(s, [0, 1], [30, 0])}px) rotate(${[-3, 4, -2][i]}deg)`,
            }}>
              <Img src={staticFile(`photos/${img}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          );
        })}
      </div>

      <Caption delay={100}>They open a link. No app. No account. Just photos.</Caption>
    </Shell>
  );
}

/* ── Scene 5: Brief Arrives (Dashboard) ────────────────── */

function SceneBriefArrives({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Shell duration={duration}>
      <AmbientBackground />
      <div style={{ position: "absolute", left: 116, top: 145, ...useEntrance(4, 20) }}>
        <Kicker>Step 3</Kicker>
        <BigTitle maxWidth={620}>Everything you need to act — in one place.</BigTitle>
      </div>

      <GlassCard style={{ position: "absolute", right: 80, top: 80, width: 880, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 30, fontWeight: 800, color: COLORS.foreground }}>Roof inspection — Sarah Mitchell</div>
            <div style={{ fontSize: 17, color: COLORS.muted, marginTop: 4 }}>Email request · Ready to review</div>
          </div>
          <div style={{ borderRadius: 999, padding: "11px 16px", background: COLORS.successLight, color: COLORS.success, fontSize: 15, fontWeight: 850 }}>Complete</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {["wide-garage.jpg", "pile-closeup.jpg", "appliances.jpg", "driveway-access.jpg"].map((img, i) => {
            const s = spring({ frame: frame - 30 - i * 16, fps, config: SPRING.cinematic });
            return (
              <div key={img} style={{
                opacity: interpolate(s, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(s, [0, 1], [18, 0])}px)`,
                height: 170,
                borderRadius: 24,
                overflow: "hidden",
                position: "relative",
              }}>
                <Img src={staticFile(`photos/${img}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", right: 12, top: 12, borderRadius: 999, padding: "6px 10px", background: "rgba(21,128,79,0.92)", color: COLORS.white, fontSize: 13, fontWeight: 850 }}>✓</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 16, marginTop: 18 }}>
          <div style={{ borderRadius: 28, padding: 22, background: "rgba(124,58,237,0.07)", border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 15, fontWeight: 850, textTransform: "uppercase", letterSpacing: 1.2, color: COLORS.primary }}>Summary</div>
            <div style={{ marginTop: 10, fontSize: 22, lineHeight: 1.28, fontWeight: 680, color: COLORS.foreground }}>
              Front and rear slopes visible. Shingle wear near ridge. Flashing intact. Good for remote estimate.
            </div>
          </div>
          <div style={{ borderRadius: 28, padding: 22, background: COLORS.bgCardSolid, border: `1px solid ${COLORS.border}` }}>
            <div style={{ fontSize: 15, fontWeight: 850, textTransform: "uppercase", letterSpacing: 1.2, color: COLORS.muted }}>AI checks</div>
            {[
              { label: "Subject visible", status: "Pass", color: COLORS.success },
              { label: "Image quality", status: "Good", color: COLORS.success },
              { label: "Label readable", status: "Usable", color: COLORS.warning },
            ].map((check, i) => {
              const s = spring({ frame: frame - 80 - i * 20, fps, config: SPRING.snap });
              return (
                <div key={check.label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  marginTop: i === 0 ? 14 : 10,
                  opacity: interpolate(s, [0, 1], [0, 1]),
                  transform: `translateX(${interpolate(s, [0, 1], [16, 0])}px)`,
                }}>
                  <span style={{ fontSize: 17, fontWeight: 650, color: COLORS.foreground }}>{check.label}</span>
                  <span style={{ borderRadius: 999, padding: "5px 10px", background: `${check.color}22`, color: check.color, fontSize: 13, fontWeight: 850 }}>{check.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </GlassCard>

      <Caption delay={60}>Photos, AI checks, and a summary — ready to act on.</Caption>
    </Shell>
  );
}

/* ── Scene 6: Beta Transition ──────────────────────────── */

function SceneBetaTransition({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headlineS = spring({ frame: frame - 10, fps, config: SPRING.cinematic });
  const kickerS = spring({ frame: frame - 30, fps, config: SPRING.cinematic });

  return (
    <Shell duration={duration} dark>
      <div style={{ position: "absolute", width: 800, height: 800, borderRadius: 999, left: "50%", top: "50%", marginLeft: -400, marginTop: -400, background: `radial-gradient(circle, ${COLORS.primary}55, transparent 65%)`, filter: "blur(70px)" }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28 }}>
        <div style={{
          opacity: interpolate(kickerS, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(kickerS, [0, 1], [14, 0])}px)`,
        }}>
          <Kicker tone="dark">Founding Partner Beta</Kicker>
        </div>
        <div style={{
          fontFamily: FONT.display,
          fontSize: 72,
          lineHeight: 1.0,
          letterSpacing: -4,
          fontWeight: 780,
          textAlign: "center",
          maxWidth: 900,
          opacity: interpolate(headlineS, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(headlineS, [0, 1], [30, 0])}px)`,
          ...gradientTextStyle(),
        }}>
          We're building this with you.
        </div>
      </div>
    </Shell>
  );
}

/* ── Scene 7: What Partners Get ────────────────────────── */

function ScenePartnerBenefits({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const benefits = [
    { icon: "🎁", title: "60 days free access", desc: "Full product, no credit card, no limits during beta" },
    { icon: "🛠", title: "Concierge setup", desc: "We configure your first templates and workflows with you" },
    { icon: "💬", title: "Direct feedback channel", desc: "Priority input via chat, email, or in-app — your voice shapes the product" },
    { icon: "🚀", title: "Early access", desc: "First to use every new feature before public launch" },
    { icon: "💰", title: "Up to 75% off post-launch", desc: "Permanent discounts based on feedback quality — top 2 get Pro free for life" },
  ];

  return (
    <Shell duration={duration}>
      <AmbientBackground />
      <div style={{ position: "absolute", left: 120, top: 140, ...useEntrance(4, 20) }}>
        <Kicker>What you get</Kicker>
        <BigTitle maxWidth={540}>Everything you need to start.</BigTitle>
        <BodyCopy maxWidth={480}>Join as a founding partner and help shape the tool from day one.</BodyCopy>
      </div>

      <div style={{ position: "absolute", right: 100, top: 100, width: 820, display: "flex", flexDirection: "column", gap: 14 }}>
        {benefits.map((b, i) => {
          const s = spring({ frame: frame - 20 - i * 22, fps, config: SPRING.snap });
          return (
            <div key={b.title} style={{
              display: "flex", alignItems: "center", gap: 20,
              borderRadius: 24,
              padding: "22px 28px",
              background: i === 4 ? "rgba(124,58,237,0.08)" : COLORS.glassBg,
              border: i === 4 ? `1.5px solid ${COLORS.primary}44` : `1px solid ${COLORS.border}`,
              boxShadow: i === 4 ? SHADOW.glow : SHADOW.soft,
              opacity: interpolate(s, [0, 1], [0, 1]),
              transform: `translateX(${interpolate(s, [0, 1], [40, 0])}px)`,
            }}>
              <div style={{ fontSize: 36, flexShrink: 0, width: 52, textAlign: "center" }}>{b.icon}</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.foreground, fontFamily: FONT.display }}>{b.title}</div>
                <div style={{ fontSize: 16, fontWeight: 500, color: COLORS.muted, marginTop: 4 }}>{b.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      <Caption delay={100}>Everything you need to start. Nothing to lose.</Caption>
    </Shell>
  );
}

/* ── Scene 8: Reward Tiers ─────────────────────────────── */

function SceneRewardTiers({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const tiers = [
    { label: "Top 2", count: "2 partners", reward: "Free Pro for life", accent: true },
    { label: "Elite", count: "4 partners", reward: "75% off in perpetuity", accent: false },
    { label: "Strong", count: "4 partners", reward: "50% off in perpetuity", accent: false },
    { label: "Solid", count: "10 partners", reward: "75% off first year", accent: false },
    { label: "Participating", count: "10 partners", reward: "50% off first year", accent: false },
  ];

  return (
    <Shell duration={duration} dark>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(circle at 50% 50%, black, transparent 72%)" }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 80 }}>
        <div style={{ ...useEntrance(4, 16), marginBottom: 48 }}>
          <Kicker tone="dark">Reward tiers</Kicker>
          <div style={{
            marginTop: 20,
            fontFamily: FONT.display,
            fontSize: 52,
            lineHeight: 1.0,
            letterSpacing: -3,
            fontWeight: 780,
            color: COLORS.white,
            textAlign: "center",
            maxWidth: 900,
          }}>
            Your feedback determines your reward.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 1000 }}>
          {tiers.map((tier, i) => {
            const s = spring({ frame: frame - 40 - i * 18, fps, config: SPRING.snap });
            const isTop = tier.accent;
            const pulse = isTop ? Math.sin(frame * 0.06) * 0.15 + 0.85 : 1;

            return (
              <div key={tier.label} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                borderRadius: 20,
                padding: isTop ? "22px 28px" : "16px 28px",
                background: isTop ? "rgba(124,58,237,0.18)" : "rgba(255,255,255,0.06)",
                border: isTop ? `1.5px solid ${COLORS.primaryGlow}` : "1px solid rgba(255,255,255,0.10)",
                boxShadow: isTop ? `0 0 40px rgba(124,58,237,${0.3 * pulse})` : "none",
                opacity: interpolate(s, [0, 1], [0, 1]),
                transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px) scale(${isTop ? interpolate(s, [0, 1], [0.95, 1]) : 1})`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    borderRadius: 999,
                    padding: isTop ? "8px 16px" : "6px 14px",
                    background: isTop ? GRADIENT_PRIMARY : "rgba(255,255,255,0.10)",
                    color: COLORS.white,
                    fontFamily: FONT.display,
                    fontSize: isTop ? 18 : 16,
                    fontWeight: 850,
                  }}>
                    {tier.label}
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.50)" }}>{tier.count}</span>
                </div>
                <div style={{
                  fontFamily: FONT.display,
                  fontSize: isTop ? 24 : 20,
                  fontWeight: isTop ? 850 : 700,
                  color: isTop ? COLORS.primaryGlow : "rgba(255,255,255,0.78)",
                  letterSpacing: isTop ? -0.5 : 0,
                }}>
                  {tier.reward}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Caption delay={80} dark>Rewards based on feedback quality, not usage volume.</Caption>
    </Shell>
  );
}

/* ── Scene 9: Closing CTA ──────────────────────────────── */

function SceneClosing({ duration }: { duration: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoS = spring({ frame: frame - 6, fps, config: SPRING.cinematic });
  const line1S = spring({ frame: frame - 24, fps, config: SPRING.cinematic });
  const line2S = spring({ frame: frame - 42, fps, config: SPRING.cinematic });
  const ctaS = spring({ frame: frame - 70, fps, config: SPRING.cinematic });
  const seatsS = spring({ frame: frame - 90, fps, config: SPRING.cinematic });
  const urlS = spring({ frame: frame - 110, fps, config: SPRING.cinematic });

  const pulse = Math.sin(frame * 0.04) * 0.12 + 0.88;

  return (
    <Shell duration={duration} dark>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)", backgroundSize: "60px 60px", maskImage: "radial-gradient(circle at 50% 45%, black, transparent 72%)" }} />
      <div style={{ position: "absolute", width: 1000, height: 1000, borderRadius: 999, left: "50%", top: "50%", marginLeft: -500, marginTop: -500, background: `radial-gradient(circle, ${COLORS.primary}44, transparent 66%)`, filter: "blur(60px)", opacity: pulse }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0 }}>
        <div style={{ opacity: interpolate(logoS, [0, 1], [0, 1]), transform: `scale(${interpolate(logoS, [0, 1], [0.9, 1])})`, marginBottom: 48 }}>
          <LogoLockup light height={72} />
        </div>

        <div style={{
          fontFamily: FONT.display,
          fontSize: 72,
          lineHeight: 1.0,
          letterSpacing: -4,
          fontWeight: 780,
          color: COLORS.white,
          textAlign: "center",
          maxWidth: 1100,
          opacity: interpolate(line1S, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(line1S, [0, 1], [24, 0])}px)`,
        }}>
          30 seats. 60 days.
        </div>
        <div style={{
          fontFamily: FONT.display,
          fontSize: 72,
          lineHeight: 1.0,
          letterSpacing: -4,
          fontWeight: 780,
          textAlign: "center",
          maxWidth: 1100,
          marginTop: 8,
          opacity: interpolate(line2S, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(line2S, [0, 1], [24, 0])}px)`,
          ...gradientTextStyle(),
        }}>
          Your feedback shapes the product.
        </div>

        <div style={{
          marginTop: 48,
          display: "flex",
          alignItems: "center",
          gap: 20,
          opacity: interpolate(ctaS, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(ctaS, [0, 1], [18, 0])}px)`,
        }}>
          <div style={{
            borderRadius: 999,
            padding: "20px 34px",
            background: GRADIENT_PRIMARY,
            color: COLORS.white,
            fontFamily: FONT.body,
            fontSize: 24,
            fontWeight: 850,
            boxShadow: SHADOW.glow,
          }}>
            Apply for the founding beta
          </div>
        </div>

        <div style={{
          marginTop: 20,
          borderRadius: 999,
          padding: "10px 20px",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.12)",
          fontFamily: FONT.body,
          fontSize: 18,
          fontWeight: 700,
          color: "rgba(255,255,255,0.60)",
          opacity: interpolate(seatsS, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(seatsS, [0, 1], [12, 0])}px)`,
        }}>
          30 of 30 seats open
        </div>

        <div style={{
          marginTop: 20,
          fontFamily: FONT.body,
          fontSize: 20,
          fontWeight: 650,
          color: "rgba(255,255,255,0.52)",
          opacity: interpolate(urlS, [0, 1], [0, 1]),
        }}>
          photobrief.ai
        </div>
      </div>
    </Shell>
  );
}

/* ── Main Composition ──────────────────────────────────── */

export const MainVideo: React.FC = () => {
  let offset = 0;
  const seq = (d: number) => { const from = offset; offset += d; return from; };

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bgDark }}>
      <Sequence from={seq(D_HOOK)} durationInFrames={D_HOOK}>
        <SceneHook duration={D_HOOK} />
      </Sequence>
      <Sequence from={seq(D_VALUEPROP)} durationInFrames={D_VALUEPROP}>
        <SceneValueProp duration={D_VALUEPROP} />
      </Sequence>
      <Sequence from={seq(D_CREATE)} durationInFrames={D_CREATE}>
        <SceneCreateRequest duration={D_CREATE} />
      </Sequence>
      <Sequence from={seq(D_CAPTURE)} durationInFrames={D_CAPTURE}>
        <SceneCustomerCapture duration={D_CAPTURE} />
      </Sequence>
      <Sequence from={seq(D_BRIEF)} durationInFrames={D_BRIEF}>
        <SceneBriefArrives duration={D_BRIEF} />
      </Sequence>
      <Sequence from={seq(D_BETA_TRANSITION)} durationInFrames={D_BETA_TRANSITION}>
        <SceneBetaTransition duration={D_BETA_TRANSITION} />
      </Sequence>
      <Sequence from={seq(D_PARTNER_BENEFITS)} durationInFrames={D_PARTNER_BENEFITS}>
        <ScenePartnerBenefits duration={D_PARTNER_BENEFITS} />
      </Sequence>
      <Sequence from={seq(D_REWARD_TIERS)} durationInFrames={D_REWARD_TIERS}>
        <SceneRewardTiers duration={D_REWARD_TIERS} />
      </Sequence>
      <Sequence from={seq(D_CLOSING)} durationInFrames={D_CLOSING}>
        <SceneClosing duration={D_CLOSING} />
      </Sequence>
    </AbsoluteFill>
  );
};
