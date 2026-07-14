import { motion, useReducedMotion } from "motion/react";
import { EASE } from "./motionConfig";

/**
 * Reveal — fades + lifts its children into place once they scroll into view.
 * Collapses to a plain, instantly-visible element under reduced motion.
 */
export function Reveal({
  as = "div",
  y = 28,
  delay = 0,
  duration = 0.7,
  once = true,
  amount = 0.3,
  className,
  children,
  ...rest
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as] || motion.div;

  if (reduce) {
    const Plain = as;
    return (
      <Plain className={className} {...rest}>
        {children}
      </Plain>
    );
  }

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Stagger — wraps a single grid/list item so a mapped collection animates in
 * as a cascade. Pass the map index; delay is capped so long lists never crawl.
 */
export function Stagger({ index = 0, className, children, y = 24, ...rest }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={className} {...rest}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: Math.min(index, 8) * 0.05, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
