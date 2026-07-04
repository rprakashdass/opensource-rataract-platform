/**
 * Database types - mirrors Prisma schema
 * Generated types should eventually come from Prisma
 */

export type Club = {
  id: string;
  name: string;
  district?: string | null;
  country: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  description?: string | null;
  missionStatement?: string | null;
  visionStatement?: string | null;
  primaryColor: string;
  secondaryColor: string;
  socialMedia?: Record<string, string> | null;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
};

export enum Role {
  ADMIN = "ADMIN",
  CLUB_ADMIN = "CLUB_ADMIN",
  PRESIDENT = "PRESIDENT",
  SECRETARY = "SECRETARY",
  TREASURER = "TREASURER",
  BOARD_MEMBER = "BOARD_MEMBER",
  MEMBER = "MEMBER",
  GUEST = "GUEST",
}

export type Member = {
  id: string;
  userId: string;
  clubId: string;
  role: Role;
  joinedAt: Date;
  phone?: string | null;
  profession?: string | null;
  companyName?: string | null;
  location?: string | null;
  bio?: string | null;
  bloodGroup?: string | null;
  canDonate: boolean;
  lastDonation?: Date | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type BoardMember = {
  id: string;
  memberId: string;
  clubId: string;
  position: string;
  order: number;
  joinedAt: Date;
  leftAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Event = {
  id: string;
  clubId: string;
  title: string;
  slug: string;
  description?: string | null;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  startDate: Date;
  endDate?: Date | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  capacity?: number | null;
  registeredCount: number;
  status: string;
  tags: string[];
  category?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Project = {
  id: string;
  clubId: string;
  title: string;
  slug: string;
  description?: string | null;
  status: string;
  category?: string | null;
  startDate: Date;
  endDate?: Date | null;
  imageUrl?: string | null;
  impact?: string | null;
  beneficiaries?: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GalleryItem = {
  id: string;
  clubId: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  thumbnailUrl?: string | null;
  eventId?: string | null;
  category?: string | null;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};
