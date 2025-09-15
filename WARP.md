# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project type: Next.js 15 (App Router) + AWS Amplify (Gen2) backend

Commands
- Development server
  - npm run dev
- Build and run
  - npm run build
  - npm run start
- Lint/format
  - npm run lint
  - npx ultracite format .
- Clean and optimized build
  - npm run clean
  - npm run build:optimized
- Bundle analysis
  - npm run analyze
  - npm run analyze:bundle
- Amplify backend (Gen2)
  - npx ampx sandbox          # local/sandbox backend
  - npx ampx deploy           # deploy backend
  - npx ampx generate outputs # refresh amplify_outputs.json used by app

Notes
- Prefer npm (package-lock.json is present). CI config (amplify.yml) uses yarn, but local development is npm-first.
- On Windows (pwsh), the above commands run as-is.

High-level architecture
- App shell and routing (Next.js App Router)
  - src/app/layout.tsx defines global HTML, metadata, structured data (Organization, Website JSON-LD), Google Analytics, and performance preconnects. It also provides Suspense fallback and an ErrorBoundary.
  - next.config.ts configures rewrites so / → /website and other legacy paths map to new routes. It also tunes webpack splitChunks and experimental flags, and restricts remote image hosts.
- Authentication and Amplify integration
  - amplify/auth/resource.ts defines Cognito-based auth with email login and custom attributes (custom:userRole, custom:termsAccepted, certificate-related fields, etc.).
  - amplify-config.ts and src/app/ConfigureAmplifyClientSide.tsx configure Amplify using amplify_outputs.json. Amplify is intentionally not globally initialized in layout; it is loaded conditionally only where needed (see project_info/AMPLIFY_AUTH_IMPLEMENTATION_SUMMARY.md for rationale and affected pages/layouts).
  - Auth state is handled via Amplify on the client; Redux is used for in-memory user profile data (per the summary doc). Session tokens are stored securely by Amplify and survive refresh.
- Backend domain logic (Amplify Functions + Prisma)
  - amplify/functions/... contains typed operations. Example: create-user function uses a Prisma client provided by a shared Lambda layer, connects using DB_CONNECTION_DETAILS secret, validates input, creates users, and emits notifications.
  - Business operations are split between UserOperations (transactional orchestration) and UserDatabaseOperations (pure data access), using Prisma types generated into the lambda-layer.
- Auctions feature (client-first data with TanStack Query)
  - src/features/auctions/components/* renders listings and details. AuctionListingsGrid uses fetchAuctionListings(); AuctionDetailClient renders gallery, bidding area, and gated content (manifest/details) based on auth role via usePublicPageAuth.
  - src/app/(shop)/collections/auctions/page.tsx lists auctions; src/app/(shop)/marketplace/auction/[id]/page.tsx shows an auction detail, fetching via useQuery with sensible stale/gc times and Suspense fallbacks. Navigation uses DynamicBreadcrumb.
- SEO & analytics
  - Structured data: BreadcrumbSchema component is injected from src/components/BreadcrumbSchema.
  - Metadata: getOrganizationSchema/getWebsiteSchema used in layout. OpenGraph/Twitter configured.
  - Analytics: GA (gtag) and Reddit pixel are loaded afterInteractive in layout.

Important configurations and rules
- next.config.ts
  - Rewrites: '/', '/team', and seller listing legacy paths → newer destinations.
  - Images: Only whitelisted remote hosts are allowed; AVIF/WebP formats enabled.
  - Build performance: splitChunks groups framework/lib/commons, terser minification enabled for prod. Dev uses filesystem cache.
  - Experimental: optimizePackageImports (lucide-react, date-fns, and select Radix packages), optimizeCss, scrollRestoration, serverActions bodySizeLimit, memoryBasedWorkersCount.
- .cursor/rules/ultracite.mdc (selected, high-impact excerpts)
  - Accessibility and Next.js rules: no next/head, no <img> in Next.js projects; prefer proper roles/ARIA usage; language attributes; avoid dangerous JSX props; ensure required a11y attributes.
  - Code style and safety: avoid console in committed code, avoid any, unused vars/imports, nested ternaries, debugger, var, and fragile patterns. Prefer import type, export type, arrow functions, const, template literals.
  - React-specific: call hooks at top level; ensure key props; avoid passing children as props; don’t define components inside components unless intended; avoid array index as key; ensure exhaustive switch where relevant.
- Amplify deployment pipeline (amplify.yml)
  - Backend: yarn install, then yarn ampx pipeline-deploy.
  - Frontend: yarn run build, artifacts from .next.

Working effectively in this repo
- After changing Amplify backend, regenerate outputs consumed by the app:
  - npx ampx generate outputs
- If amplify_outputs.json is missing or outdated, the app’s Amplify initialization will fail; regenerate outputs before running dev/build.
- When adding pages that require auth, load Amplify only in those routes/layouts (do not re-introduce global Amplify in src/app/layout.tsx). See project_info/AMPLIFY_AUTH_IMPLEMENTATION_SUMMARY.md for the established pattern (AuthRequiredLayout, auth layouts, etc.).
- For image usage, rely on next/image and ensure remote host is allowed in next.config.ts.
- For auctions, prefer the shared utilities in src/features/auctions/services for formatting (e.g., formatBidCount, formatTimeLeft) and data access.

Derived from repository files
- package.json scripts
- next.config.ts (rewrites, images, webpack, experimental)
- amplify/*.ts and amplify.yml (auth, functions, deployment)
- src/app/layout.tsx (global shell, analytics, JSON-LD)
- src/features/auctions/* and src/app/(shop)/* (feature structure)
- .cursor/rules/ultracite.mdc (rules that affect code generation and linting)

