"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { File } from "lucide-react";
import { SocialPreviewDock } from "@/components/ruixen/social-preview-dock";
import { LiquidMetalButton } from "@/components/ui/liquid-metal";
import { ThemeToggleButton4 } from "@/components/ui/skiper-ui/skiper4";
const GitHubCalendar = dynamic(
  () => import("react-github-calendar").then((mod) => mod.GitHubCalendar),
  { ssr: false },
);
const ViscoseCarousel = dynamic(() => import("@/components/viscose/Carousel"), { ssr: false });

const experiences = [
  {
    role: "Undergraduate Research Assistant",
    company: "University of Calgary",
    location: "Calgary, AB",
    period: "Sep 2025 – March 2026",
    bullets: [
      "Fine-tuned Microsoft Phi-2 on curated mental health data to create a focused language model.",
      "Built the supporting RAG, safety routing, and context memory pipeline for reliable responses.",
    ],
    designNote: "Designed the chatbot UI as Aither UI with a calm, clear interaction flow.",
    designLink: "https://www.figma.com/design/aAeJbCf29uCeADBX7WGQoG/Aither-UI?node-id=0-1&t=MuqcccCKCusr36Sr-1",
  },
];

const coursework = [
  "Data Structures and Algorithms",
  "Software Engineering",
  "Calculus II",
  "Information Security and Privacy",
];

const uiCredits = [
  { label: "Ruixen UI", href: "https://ruixen.com/" },
  { label: "3D icons", href: "https://app.iconsax.io/?tab=ai" },
  { label: "Viscose carousel", href: "https://github.com/Yousuf-developer/Viscose-carousel" },
  { label: "One Prompt Design", href: "https://onepromptdesign.com/" },
];

function Intro({ onComplete }: { onComplete: () => void }) {
  const [introReady, setIntroReady] = useState(false);

  useEffect(() => {
    const minimumDuration = window.setTimeout(() => setIntroReady(true), 2500);
    return () => window.clearTimeout(minimumDuration);
  }, []);

  return (
    <div className={`intro-overlay ${introReady ? "intro-ready" : ""}`} onAnimationEnd={(event) => {
      if (event.target === event.currentTarget) onComplete();
    }} aria-hidden="true">
      <motion.span
        className="intro-name"
        initial="hidden"
        animate="visible"
        whileHover={{ rotate: -2, y: -2, scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", duration: 0.3, bounce: 0 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.11 } },
        }}
      >
        {[..."Bilal"].map((letter, index) => (
          <motion.span
            key={`${letter}-${index}`}
            variants={{
              hidden: { opacity: 0, y: 10, filter: "blur(5px)" },
              visible: { opacity: 1, y: 0, filter: "blur(0px)" },
            }}
            transition={{ duration: 0.48, ease: "easeOut" }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.span>
    </div>
  );
}

function Portfolio() {
  const [dark, setDark] = useState(true);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const resumeTriggerRef = useRef<HTMLButtonElement>(null);
  const resumeDialogRef = useRef<HTMLElement>(null);
  const resumeConfirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!resumeDialogOpen) return;

    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const resumeTrigger = resumeTriggerRef.current;
    const previousOverflow = document.body.style.overflow;
    const focusFrame = window.requestAnimationFrame(() => resumeConfirmRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setResumeDialogOpen(false);
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = Array.from(
        resumeDialogRef.current?.querySelectorAll<HTMLElement>(
          "button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
        ) ?? [],
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      const returnTarget = resumeTrigger ?? previouslyFocused;
      if (returnTarget && document.contains(returnTarget)) returnTarget.focus();
    };
  }, [resumeDialogOpen]);

  const downloadResume = () => {
    const link = document.createElement("a");
    link.href = "/Bilal_Ahmed_Resume.pdf";
    link.download = "Bilal_Ahmed_Resume.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setResumeDialogOpen(false);
  };

  return <div className={`portfolio ${dark ? "dark" : "light"}`}>
    <main className="container">
    <header className="profile-header"><div><h1>Bilal Ahmed</h1><p>ML/AI | SWE &amp; Design</p></div><div className="socials"><SocialPreviewDock className="social-preview-dock" profile={{ username: "BilalA5", xHandle: "bAMD5", name: "Bilal Ahmed", bio: "AI evolution · software engineering · design", links: { github: "https://github.com/BilalA5/portfolio", x: "https://x.com/bAMD5" } }} /><LiquidMetalButton ref={resumeTriggerRef} className="resume-liquid-button" type="button" size="sm" borderWidth={2} icon={<File size={15} strokeWidth={1.8} />} onClick={() => setResumeDialogOpen(true)} aria-label="Open resume download dialog" aria-haspopup="dialog" metalConfig={{ colorBack: dark ? "#64666b" : "#b8bcc4", colorTint: "#ffffff", speed: 0.55, repetition: 4, distortion: 0.16, scale: 1 }}><span className="sr-only">Resume</span></LiquidMetalButton><ThemeToggleButton4 className="theme-toggle-skiper" isDark={dark} onClick={() => setDark(!dark)} aria-label="Toggle color theme" aria-pressed={dark} /></div></header>
      <section className="intro"><div className="intro-copy"><p>Hi, I&apos;m Bilal, a CS student @ UCalgary.</p><div className="interest-block"><p className="muted"><span className="interest-highlight">I&apos;m interested in how AI is evolving</span>, how the frontier keeps pushing past its limits and what becomes possible next.</p></div><p className="muted">I enjoy turning research and ideas into useful tools, thoughtful interfaces, and experiments that make complex technology easier to understand.</p></div></section>
      <section className="section performance-section"><SectionTitle title="Performance" /><div className="heatmap"><GitHubCalendar username="BilalA5" year="last" className="minimal-calendar" colorScheme={dark ? "dark" : "light"} blockSize={8} blockMargin={2} blockRadius={2} fontSize={10} theme={{ light: ["#e8f1ff", "#2455d6"], dark: ["#14233f", "#70a7ff"] }} tooltips={{ activity: { text: activity => `${activity.count} contributions on ${activity.date}` } }} /></div></section>
      <section className="section coursework-section"><SectionTitle title="Coursework" /><ul className="coursework-list" aria-label="Selected coursework">{coursework.map((course, index) => <li key={course}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><span>{course}</span></li>)}</ul></section>
      <section className="section"><SectionTitle title="Experience" /><div className="experience-timeline">{experiences.map(exp => <article className="timeline-item" key={exp.role}><div className="experience-card"><div className="experience-crest-background" aria-hidden="true" /><div className="experience-heading"><div className="experience-title"><div><h3>{exp.role}</h3><p><a href="https://www.ucalgary.ca" target="_blank" rel="noreferrer">{exp.company}</a> · {exp.location}</p></div></div><time>{exp.period}</time></div><div className="experience-body"><ul>{exp.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}</ul><p className="experience-design-note">{exp.designNote}</p><a className="experience-project-link" href={exp.designLink} target="_blank" rel="noreferrer">View Aither UI <span aria-hidden="true">↗</span></a></div></div></article>)}</div></section>
      <ProjectsWorld dark={dark} />
    </main>
    {resumeDialogOpen && <div className="resume-dialog-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setResumeDialogOpen(false); }}>
      <section ref={resumeDialogRef} className="resume-dialog" role="dialog" aria-modal="true" aria-labelledby="resume-dialog-title" aria-describedby="resume-dialog-description">
        <button type="button" className="resume-dialog-close" onClick={() => setResumeDialogOpen(false)} aria-label="Close resume dialog">×</button>
        <h2 id="resume-dialog-title">Download resume?</h2>
        <p id="resume-dialog-description">Would you like to download my resume as a PDF?</p>
        <div className="resume-dialog-actions">
          <button ref={resumeConfirmRef} type="button" className="resume-dialog-confirm" onClick={downloadResume}>Download resume</button>
        </div>
      </section>
    </div>}
  </div>;
}

function ProjectsWorld({ dark }: { dark: boolean }) {
  const [carouselComplete, setCarouselComplete] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const transitionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(transitionRef, { amount: 0.3, once: false });
  const { scrollYProgress } = useScroll({ target: transitionRef, offset: ["start end", "end start"] });
  const portalScale = useTransform(scrollYProgress, [0, 0.48], [0.72, 1.08]);
  const portalOpacity = useTransform(scrollYProgress, [0, 0.28], [0.28, 1]);
  const portalClip = useTransform(scrollYProgress, [0, 0.48], ["inset(34% 20% round 28px)", "inset(-4% -4% round 0px)"]);
  const portalRadius = useTransform(scrollYProgress, [0, 0.48], ["22px", "0px"]);
  const introOpacity = useTransform(scrollYProgress, [0, 0.1, 0.3], [0, 1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.1, 0.3], [24, 0, -24]);
  const introScale = useTransform(scrollYProgress, [0, 0.1, 0.3], [0.9, 1, 1.04]);
  const labelOpacity = useTransform(scrollYProgress, [0, 0.18], [1, dark ? 0 : 0.72]);
  const labelY = useTransform(scrollYProgress, [0, 0.18], [0, -18]);

  return (
    <section className="section projects-section">
      <motion.div className={`projects-transition ${dark ? "is-dark" : "is-light"}`} ref={transitionRef} style={{ borderRadius: portalRadius }}>
        <motion.div className="projects-transition-label" style={{ opacity: labelOpacity, y: labelY }}>
          <span>Projects</span>
          <small>Scroll to enter</small>
        </motion.div>
        <motion.div className="projects-intro" style={{ opacity: introOpacity, y: introY, scale: introScale }} aria-hidden="true">
          <span>Projects</span>
        </motion.div>
        <motion.div className={`viscose-world ${dark ? "is-dark" : "is-light"}`} style={{ scale: portalScale, opacity: portalOpacity, clipPath: portalClip }}>
          {isInView && <ViscoseCarousel dark={dark} playIntro onReachEnd={() => setCarouselComplete(true)} />}
        </motion.div>
      </motion.div>
      {carouselComplete && <motion.section
          className="ui-credits"
          initial={{ opacity: 0, transform: shouldReduceMotion ? "translateY(0)" : "translateY(8px)" }}
          whileInView={{ opacity: 1, transform: "translateY(0)" }}
          viewport={{ once: true, amount: 0.55 }}
          transition={{ duration: shouldReduceMotion ? 0.16 : 0.24, ease: [0.23, 1, 0.32, 1] }}
          aria-labelledby="ui-credits-title"
        >
          <h2 id="ui-credits-title">UI credits</h2>
          <nav className="ui-credits-links" aria-label="UI credits links">
            {uiCredits.map((credit) => (
              <a key={credit.href} href={credit.href} target="_blank" rel="noreferrer noopener">
                {credit.label}
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </nav>
        </motion.section>}
    </section>
  );
}

function SectionTitle({ title, action }: { title: string; action?: string }) { return <div className="section-title"><h2>{title}</h2>{action && <span>{action}</span>}</div>; }

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);

  useLayoutEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Portfolio />
      {showIntro && <Intro onComplete={() => setShowIntro(false)} />}
    </>
  );
}
