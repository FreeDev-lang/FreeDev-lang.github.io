import type { Transition, Variants } from 'framer-motion'

/* ─────────────────────────────────────────────────────────────────────────────
 * Fria motion language — calm, premium, furniture-grade
 * Import variants + transitions across components for consistent feel.
 * ─────────────────────────────────────────────────────────────────────────── */

/** Core timing & distance tokens */
export const motionConfig = {
  duration: {
    instant: 0.12,
    fast: 0.18,
    base: 0.24,
    slow: 0.36,
    slower: 0.48,
  },
  ease: {
    /** Primary ease — smooth deceleration */
    out: [0.22, 1, 0.36, 1] as const,
    /** Gentle symmetric ease */
    inOut: [0.45, 0, 0.55, 1] as const,
  },
  distance: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },
  lift: {
    /** Card hover vertical offset (px) */
    card: -5,
  },
  scale: {
    /** Product / gallery image hover */
    imageHover: 1.04,
    /** Tap feedback on buttons */
    buttonPress: 0.98,
    /** Dropdown / popover entrance */
    dropdown: 0.98,
    /** Modal / dialog entrance */
    modal: 0.96,
    /** FAB / chat launcher (one-time entrance) */
    fabEnter: 0.92,
  },
  stagger: {
    /** Delay between staggered children (seconds) */
    child: 0.06,
    /** Max total stagger cap for long lists */
    maxDelay: 0.42,
  },
} as const

/* ── Reusable transitions ── */

export const transitions = {
  instant: {
    duration: motionConfig.duration.instant,
    ease: motionConfig.ease.out,
  } satisfies Transition,

  fast: {
    duration: motionConfig.duration.fast,
    ease: motionConfig.ease.out,
  } satisfies Transition,

  base: {
    duration: motionConfig.duration.base,
    ease: motionConfig.ease.out,
  } satisfies Transition,

  slow: {
    duration: motionConfig.duration.slow,
    ease: motionConfig.ease.out,
  } satisfies Transition,

  /** Soft spring — drawers, panels (no bounce) */
  spring: {
    type: 'spring',
    stiffness: 380,
    damping: 32,
    mass: 0.8,
  } satisfies Transition,

  /** Drawer / mobile menu slide */
  drawer: {
    type: 'spring',
    stiffness: 320,
    damping: 28,
  } satisfies Transition,

  /** Image zoom on hover */
  image: {
    duration: motionConfig.duration.base,
    ease: motionConfig.ease.out,
  } satisfies Transition,

  /** Skeleton / loading pulse loop */
  skeleton: {
    duration: 1.6,
    ease: motionConfig.ease.inOut,
    repeat: Infinity,
  } satisfies Transition,
} as const

/** Stagger helper for parent `transition` prop */
export function staggerTransition(staggerChildren = motionConfig.stagger.child, delayChildren = 0) {
  return {
    staggerChildren,
    delayChildren,
  }
}

/* ── Page & section entrance ── */

/** Parent wrapper — fade in + stagger children */
export const sectionEntrance: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: staggerTransition(),
  },
}

/** Standard child — fade up */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: motionConfig.distance.sm },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.base,
  },
}

/** Larger hero / headline entrance */
export const fadeUpLg: Variants = {
  hidden: { opacity: 0, y: motionConfig.distance.md },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.slow,
  },
}

/** Simple opacity fade */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.base,
  },
}

/** Scale-in for badges / chips */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: motionConfig.scale.modal },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.fast,
  },
}

/* ── Card interactions ── */

/** Apply to `motion.article` / `motion.div` product cards */
export const cardHover = {
  rest: { y: 0 },
  hover: {
    y: motionConfig.lift.card,
    transition: transitions.fast,
  },
} as const

/** whileHover shorthand for cards */
export const cardHoverWhile = {
  y: motionConfig.lift.card,
  transition: transitions.fast,
}

/** Pair with Tailwind: transition-shadow duration-brand hover:shadow-card-hover */
export const cardImageHover = {
  rest: { scale: 1 },
  hover: {
    scale: motionConfig.scale.imageHover,
    transition: transitions.image,
  },
} as const

export const cardImageHoverWhile = {
  scale: motionConfig.scale.imageHover,
  transition: transitions.image,
}

/* ── Button interactions ── */

export const buttonMotion = {
  whileHover: { scale: 1 },
  whileTap: {
    scale: motionConfig.scale.buttonPress,
    transition: transitions.instant,
  },
} as const

/** Icon / ghost buttons — tap only, no hover scale */
export const buttonGhostMotion = {
  whileTap: {
    scale: motionConfig.scale.buttonPress,
    transition: transitions.instant,
  },
} as const

/* ── Dropdowns & popovers ── */

type PopoverOrigin = 'top' | 'top-right' | 'top-left' | 'bottom' | 'bottom-right' | 'bottom-left'

const originMap: Record<PopoverOrigin, string> = {
  top: 'top center',
  'top-right': 'top right',
  'top-left': 'top left',
  bottom: 'bottom center',
  'bottom-right': 'bottom right',
  'bottom-left': 'bottom left',
}

/** Returns style object for `style={{ transformOrigin }}` */
export function popoverOrigin(origin: PopoverOrigin = 'top-right') {
  return { transformOrigin: originMap[origin] }
}

export const dropdownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -6,
    scale: motionConfig.scale.dropdown,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.fast,
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: motionConfig.scale.dropdown,
    transition: { duration: motionConfig.duration.instant, ease: motionConfig.ease.out },
  },
}

/* ── Modals & overlays ── */

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.fast,
  },
  exit: {
    opacity: 0,
    transition: { duration: motionConfig.duration.instant },
  },
}

export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    y: motionConfig.distance.sm,
    scale: motionConfig.scale.modal,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.base,
  },
  exit: {
    opacity: 0,
    y: motionConfig.distance.sm,
    scale: motionConfig.scale.modal,
    transition: transitions.fast,
  },
}

/** Chat panel / bottom-right floating panel */
export const floatingPanelVariants: Variants = {
  hidden: {
    opacity: 0,
    y: motionConfig.distance.sm,
    scale: motionConfig.scale.modal,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitions.base,
  },
  exit: {
    opacity: 0,
    y: motionConfig.distance.sm,
    scale: motionConfig.scale.modal,
    transition: transitions.fast,
  },
}

/* ── Drawers (mobile nav) ── */

export const drawerVariants = {
  right: {
    hidden: { x: '100%' },
    visible: { x: 0, transition: transitions.drawer },
    exit: { x: '100%', transition: transitions.drawer },
  },
  left: {
    hidden: { x: '-100%' },
    visible: { x: 0, transition: transitions.drawer },
    exit: { x: '-100%', transition: transitions.drawer },
  },
} as const satisfies Record<string, Variants>

/* ── FAB / one-shot entrances ── */

export const fabEntrance: Variants = {
  hidden: { opacity: 0, scale: motionConfig.scale.fabEnter },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.spring,
  },
}

/* ── Loading & skeleton ── */

/** Framer Motion loop for skeleton blocks */
export const skeletonPulse: Variants = {
  initial: { opacity: 0.45 },
  animate: {
    opacity: [0.45, 0.75, 0.45],
    transition: transitions.skeleton,
  },
}

/** Tailwind class for CSS-only skeletons (prefer in grids) */
export const skeletonClassName = 'animate-pulse bg-secondary-200 rounded-card'

/* ── Typewriter cursor ── */

/** Prefer CSS over motion for blinking cursors — less JS overhead */
export const cursorBlinkClassName = 'inline-block w-0.5 animate-pulse bg-primary-600'

/* ── Convenience bundle ── */

export const motionVariants = {
  sectionEntrance,
  fadeUp,
  fadeUpLg,
  fadeIn,
  scaleIn,
  dropdown: dropdownVariants,
  overlay: overlayVariants,
  modal: modalVariants,
  floatingPanel: floatingPanelVariants,
  drawer: drawerVariants,
  fabEntrance,
  skeletonPulse,
} as const

/** Shorthand spread for AnimatePresence dropdowns */
export const dropdownMotion = {
  variants: dropdownVariants,
  initial: 'hidden',
  animate: 'visible',
  exit: 'exit',
} as const

/** Shorthand spread for modals / chat windows */
export const modalMotion = {
  variants: modalVariants,
  initial: 'hidden',
  animate: 'visible',
  exit: 'exit',
} as const

/** Shorthand spread for backdrop overlays */
export const overlayMotion = {
  variants: overlayVariants,
  initial: 'hidden',
  animate: 'visible',
  exit: 'exit',
} as const

export default motionConfig
