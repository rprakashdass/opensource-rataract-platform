import { Variants } from "framer-motion";

// Premium Spring configurations (damped, responsive, not bouncy)
export const springs = {
  default: { type: "spring" as const, stiffness: 120, damping: 20, mass: 1 },
  snappy: { type: "spring" as const, stiffness: 180, damping: 24, mass: 0.8 },
  slow: { type: "spring" as const, stiffness: 80, damping: 18, mass: 1.2 },
};

// Global Framer Motion variants
export const motionVariants = {
  // Page/Section entrance reveals
  fadeInUp: {
    hidden: { opacity: 0, y: 12 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: springs.default
    },
    exit: {
      opacity: 0,
      y: -12,
      transition: { duration: 0.2 }
    }
  } as Variants,

  fadeInDown: {
    hidden: { opacity: 0, y: -12 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: springs.default
    }
  } as Variants,

  // Stagger container
  staggerContainer: (staggerDelay = 0.05, delayChildren = 0) => ({
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delayChildren,
      }
    }
  }),

  // Dialogs / Modals
  dialog: {
    hidden: { opacity: 0, scale: 0.98, y: 8 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: springs.snappy
    },
    exit: { 
      opacity: 0, 
      scale: 0.98, 
      y: 8,
      transition: { duration: 0.15 }
    }
  } as Variants,

  // Drawers
  drawerRight: {
    hidden: { x: "100%", opacity: 0.9 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: springs.snappy
    },
    exit: { 
      x: "100%", 
      opacity: 0.9,
      transition: { duration: 0.2 }
    }
  } as Variants,

  // Dropdown menus
  dropdown: {
    hidden: { opacity: 0, scale: 0.95, y: -4 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: springs.snappy
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: -4,
      transition: { duration: 0.1 }
    }
  } as Variants,

  // Backdrop overlay fade
  backdrop: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.15 }
    }
  } as Variants,
};
