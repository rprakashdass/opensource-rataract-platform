/**
 * Application constants
 */

export const APP_NAME = "Rotaract Platform";
export const APP_DESCRIPTION =
  "A modern, open-source platform for Rotaract clubs and districts";

// Routes
export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  BOARD: "/board",
  EVENTS: "/events",
  PROJECTS: "/projects",
  GALLERY: "/gallery",
  LOGIN: "/auth/login",
  DASHBOARD: "/dashboard",
  ADMIN: "/admin",
} as const;

// User roles
export const ROLES = {
  ADMIN: "ADMIN",
  CLUB_ADMIN: "CLUB_ADMIN",
  PRESIDENT: "PRESIDENT",
  SECRETARY: "SECRETARY",
  TREASURER: "TREASURER",
  BOARD_MEMBER: "BOARD_MEMBER",
  MEMBER: "MEMBER",
  GUEST: "GUEST",
} as const;

// Default pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  DEFAULT_OFFSET: 0,
  MAX_LIMIT: 100,
} as const;

// Regex patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\d{10}$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
} as const;

// Event status
export const EVENT_STATUS = {
  UPCOMING: "upcoming",
  ONGOING: "ongoing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

// Project status
export const PROJECT_STATUS = {
  PLANNING: "planning",
  ONGOING: "ongoing",
  COMPLETED: "completed",
  ARCHIVED: "archived",
} as const;

// Gallery categories
export const GALLERY_CATEGORIES = {
  EVENT: "event",
  PROJECT: "project",
  ACHIEVEMENT: "achievement",
  NEWS: "news",
} as const;

// Navigation items for public site
export const PUBLIC_NAV_ITEMS = [
  { label: "Home", href: ROUTES.HOME },
  { label: "About", href: ROUTES.ABOUT },
  { label: "Board", href: ROUTES.BOARD },
  { label: "Projects", href: ROUTES.PROJECTS },
  { label: "Initiatives", href: ROUTES.EVENTS },
  { label: "Gallery", href: ROUTES.GALLERY },
] as const;

// Admin navigation items
export const ADMIN_NAV_ITEMS = [
  { label: "Dashboard", href: ROUTES.ADMIN },
  { label: "Members", href: `${ROUTES.ADMIN}/members` },
  { label: "Initiatives & Events", href: `${ROUTES.ADMIN}/events` },
  { label: "Projects", href: `${ROUTES.ADMIN}/projects` },
  { label: "Gallery", href: `${ROUTES.ADMIN}/gallery` },
  { label: "Settings", href: `${ROUTES.ADMIN}/settings` },
] as const;
