"use client";

import { useMemo, useState } from "react";

type Experience = { role: string; company: string; period: string; active?: boolean };
type Project = { title: string; description: string; tag: string; stars: string; tone: string; letter: string };

const experiences: Experience[] = [
  { role: "Open to work", company: "Full-stack & Design", period: "Jun 25 — Now", active: true },
];

const skillGroups = [
  ["Language", ["TypeScript", "JavaScript", "Rust", "Go"]],
  ["Frontend", ["React", "Next.js", "Tailwind CSS", "Motion", "Expo"]],
  ["Backend", ["Node.js", "Bun", "PostgreSQL", "Redis", "GraphQL"]],
  ["Infrastructure", ["AWS", "Vercel", "Cloudflare", "Linux", "Docker"]],
  ["Workflow", ["Neovim", "Raycast", "Cursor", "GitHub", "Linear"]],
  ["Design", ["Figma", "Paper", "Photoshop"]],
] as const;

const projects: Project[] = [
  { title: "PayKit", description: "The billing framework for TypeScript", tag: "TypeScript · OSS", stars: "1,042", tone: "emerald", letter: "P" },
  { title: "Superzed", description: "My custom Zed editor fork, archived", tag: "Rust · Editor", stars: "321", tone: "amber", letter: "Z" },
  { title: "Hitch", description: "CLI for sharing terminals with coding agents", tag: "CLI · AI Devtools", stars: "176", tone: "indigo", letter: "H" },
  { title: "OpenSec", description: "Platform to donate & subscribe spare usage", tag: "Next.js · Stripe", stars: "27", tone: "rose", letter: "O" },
];

function Icon({ name }: { name: "sun" | "moon" | "mail" | "x" | "github" | "figma" | "arrow" | "star" | "close" }) {
  const paths = { sun: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.4 6.4-.7-.7M6.3 6.3l-.7-.7m12.8 0-.7.7m-11.4 11.4-.7.7M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z", moon: "M20.4 15.4A9 9 0 0 1 8.6 3.6 9 9 0 1 0 20.4 15.4z", mail: "m3 8 7.9 5.3a2 2 0 0 0 2.2 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z", x: "M4 4l16 16M20 4 4 20", github: "M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.5-1.1-4.5-4.8 0-1.1.4-2 .1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.7-2.3 4.5-4.5 4.8.4.3.7.9.7 1.8V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z", figma: "M8.5 12a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0zm-5-3.5A3.5 3.5 0 0 1 7 5h3.5v7H7a3.5 3.5 0 0 1-3.5-3.5zM10.5 5H17a3.5 3.5 0 1 1 0 7h-6.5V5zM3.5 15A3.5 3.5 0 0 1 7 12h3.5v3.5H7A3.5 3.5 0 0 1 3.5 15zm7 0H17a3.5 3.5 0 1 1 0 7h-6.5v-7z", arrow: "m14 5 7 7-7 7m7-7H3", star: "m10 2 2 6h6l-5 4 2 6-5-3.5L6 18l2-6-5-4h6z", close: "M6 6l12 12M18 6 6 18" };
  return <svg className="icon" viewBox="0 0 24 24" fill={name === "star" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>;
}

export default function Home() {
  const [dark, setDark] = useState(true);
  const [copied, setCopied] = useState(false);
  const [modal, setModal] = useState(false);
  const [hover, setHover] = useState<{ commits: number; date: string } | null>(null);
  const heatmap = useMemo(() => Array.from({ length: 45 }, (_, week) => Array.from({ length: 7 }, (_, day) => { const seed = (week * 17 + day * 11) % 19; const level = seed < 7 ? 0 : seed < 11 ? 1 : seed < 15 ? 2 : seed < 18 ? 3 : 4; return { level, commits: level * 3 + (seed % 4), date: `Week ${week + 1}, day ${day + 1}` }; })), []);
  const copyEmail = async () => { await navigator.clipboard?.writeText("s.bilal.ahmed927@gmail.com"); setCopied(true); window.setTimeout(() => setCopied(false), 2000); };

  return <div className={`portfolio ${dark ? "dark" : "light"}`}>
    <main className="container">
      <header className="profile-header"><div><h1>Bilal Ahmed</h1><p>Full-stack engineer & designer</p></div><div className="socials"><a href="https://x.com" aria-label="X profile"><Icon name="x" /></a><a href="https://github.com" aria-label="GitHub profile"><Icon name="github" /></a><a href="https://figma.com" aria-label="Figma projects"><Icon name="figma" /></a><button onClick={copyEmail} aria-label="Copy email"><Icon name={copied ? "github" : "mail"} /></button><button className="theme-toggle" onClick={() => setDark(!dark)} aria-label="Toggle color theme"><Icon name={dark ? "sun" : "moon"} /></button></div></header>
      <section className="intro"><p>yo, I&apos;m Bilal, an engineer based in Calgary with 4 years of experience, obsessed with open source, developer tools, and good design.</p><p className="muted">So far, my projects have earned 1,500+ stars on GitHub and even $10,000 from Vercel. I also share my work online, where I&apos;ve pulled over 7M views.</p></section>
      <section className="actions"><button className="primary" onClick={() => setModal(true)}>Book a call <Icon name="arrow" /></button><a className="secondary" href="https://x.com" target="_blank" rel="noreferrer">Message on X</a></section>
      <section className="section"><SectionTitle title="Performance" /><div className="heatmap"><div className="months">{["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"].map(m => <span key={m}>{m}</span>)}</div><div className="grid">{heatmap.map((week, w) => <div className="week" key={w}>{week.map((cell, d) => <button aria-label={`${cell.commits} commits, ${cell.date}`} key={d} onMouseEnter={() => setHover(cell)} onMouseLeave={() => setHover(null)} className={`level-${cell.level}`} />)}</div>)}</div><div className="heatmap-footer"><span>{hover ? `${hover.commits} commits on ${hover.date}` : "671 contributions last year"}</span><span>Less <b className="legend"><i className="level-0" /><i className="level-1" /><i className="level-2" /><i className="level-3" /><i className="level-4" /></b> More</span></div></div></section>
      <section className="section"><SectionTitle title="Experience" action="See more ↗" /><div className="experience-grid">{experiences.map(exp => <article className="experience-card" key={exp.role}><div><div className="role"> <i className={exp.active ? "active" : ""} />{exp.role}</div><p>{exp.company}</p></div><time>{exp.period}</time></article>)}</div></section>
      <section className="section"><SectionTitle title="Skills" action="Stack & tooling" /><div className="skills">{skillGroups.map(([group, items]) => <div className="skill-row" key={group}><span className="skill-label">{group}</span><div className="chips">{items.map(skill => <span key={skill}>{skill}</span>)}</div></div>)}</div></section>
      <section className="section"><SectionTitle title="Projects" action="Featured OSS" /><div className="projects">{projects.map(project => <a className="project" href="https://github.com" target="_blank" rel="noreferrer" key={project.title}><span className={`project-icon ${project.tone}`}>{project.letter}</span><div className="project-copy"><div><strong>{project.title}</strong><small>{project.tag}</small></div><p>{project.description}</p></div><span className="stars"><Icon name="star" />{project.stars}<Icon name="arrow" /></span></a>)}</div></section>
      <footer><div className="signature">bilal.dev</div><p>© 2026 Bilal Ahmed <span>·</span> Calgary, Canada</p></footer>
    </main>
    {modal && <div className="modal-backdrop" role="presentation" onMouseDown={e => e.target === e.currentTarget && setModal(false)}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="close" onClick={() => setModal(false)} aria-label="Close dialog"><Icon name="close" /></button><h2 id="modal-title">Let&apos;s build something fast</h2><p>Available for full-time engineering roles, technical architecture consulting, and high-impact contract work.</p><a className="primary modal-link" href="mailto:s.bilal.ahmed927@gmail.com">Email me <Icon name="arrow" /></a></div></div>}
  </div>;
}

function SectionTitle({ title, action }: { title: string; action?: string }) { return <div className="section-title"><h2>{title}</h2>{action && <span>{action}</span>}</div>; }
