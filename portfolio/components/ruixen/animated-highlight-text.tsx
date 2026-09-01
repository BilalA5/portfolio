"use client";

import { motion } from "motion/react";
import { Heart, MousePointerClick, Sparkles } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

export const HeartIcon = Heart;
export const MousePointerClickIcon = MousePointerClick;
export const SparklesIcon = Sparkles;

type HighlightProps = {
  children: ReactNode;
  color?: string;
  icon?: ReactNode;
  image?: string;
  imageAlt?: string;
};

type HighlightStyle = CSSProperties & {
  "--highlight-color"?: string;
};

export function Highlight({
  children,
  color = "#70a7ff",
  icon,
  image,
  imageAlt = "",
}: HighlightProps) {
  return (
    <span
      className="animated-highlight"
      style={{ "--highlight-color": color } as HighlightStyle}
    >
      <span className="animated-highlight-label">{children}</span>
      <span className="animated-highlight-underline" aria-hidden="true" />
      <span className="animated-highlight-popover" aria-hidden="true">
        {image ? (



          <img src={image} alt={imageAlt} />
        ) : null}
        {icon ? <span className="animated-highlight-icon">{icon}</span> : null}
      </span>
    </span>
  );
}

export default function AnimatedHighlightText({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      className={`animated-highlight-text ${className}`.trim()}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.span>
  );
}
