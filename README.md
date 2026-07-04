# Rotaract Platform

A modern, production-grade, open-source platform for Rotaract clubs and districts worldwide.

## Vision

This project evolves from a public-facing website into a complete management system supporting clubs and districts globally. Built with modern engineering standards, it emphasizes maintainability, extensibility, and professional quality.

## Architecture

### Key Principles

- **Single-tenant, self-hosted**: Each club/district deploys their own instance
- **Feature-based modules**: Independently maintainable features
- **Type-safe**: Strict TypeScript throughout
- **Database-agnostic**: Built with Prisma for future portability
- **Configuration-driven**: Environment variables + database settings
- **Professional aesthetic**: Minimal, clean, accessible design

### Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Database**: PostgreSQL (via Supabase for development)
- **ORM**: Prisma
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS + custom components
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Git Hooks**: Husky + lint-staged

## Getting Started

### Prerequisites

- Node.js 20+
- npm 11+
- PostgreSQL (or Supabase account)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rotaract-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

See `.env.example` for all available configuration options.

**Key variables:**

- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_APP_NAME`: Your club name
- `AUTH_SECRET`: Secret for authentication (min 32 chars)

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # Type check with TypeScript
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public routes (home, about, etc.)
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Member dashboard
│   ├── (admin)/           # Admin interface
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Custom components
│   ├── layout/           # Layout components
│   └── common/           # Shared components
├── lib/                  # Business logic
│   ├── config/          # Configuration
│   ├── validation/       # Zod schemas
│   ├── types/           # TypeScript types
│   ├── constants/       # App constants
│   └── utils/           # Utilities
└── styles/              # Global styles
```

## Features (Sprint Roadmap)

### Sprint 1: Public Website Foundation ✅ In Progress

- [x] Homepage with hero section
- [x] About page
- [x] Board member profiles
- [x] Projects showcase
- [x] Events listing
- [x] Gallery
- [x] Contact form
- [x] Join form
- [x] Authentication UI (foundation)
- [x] Responsive design
- [x] Professional layout
- [ ] SEO optimization
- [ ] Accessibility testing

### Sprint 2: Member & Content Management

- [ ] Member authentication (email/password)
- [ ] Member dashboard
- [ ] Event management
- [ ] Project management
- [ ] Gallery management
- [ ] CMS integration

### Sprint 3+: Advanced Features

- [ ] Blood donation management
- [ ] Finance dashboard
- [ ] Inventory management
- [ ] Analytics
- [ ] District management

## Code Quality

- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier (auto on git commit)
- **Type checking**: Full TypeScript coverage

## Deployment

### Quick Start with Supabase

1. Create Supabase project
2. Set environment variables
3. Deploy to Vercel/Railway/Render

### Self-Hosted

1. Set up PostgreSQL database
2. Configure environment variables
3. Deploy Next.js app
4. Run migrations

## Contributing

Follow these guidelines:

1. Write TypeScript with strict mode
2. Use component composition
3. Validate with Zod
4. Format on commit (Husky)
5. Write clear commit messages

## License

Open source. See LICENSE for details.

---

**Built for global impact by Rotaract clubs worldwide.**
# opensource-rataract-platform
