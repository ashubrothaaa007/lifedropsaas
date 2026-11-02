# AGENTS.md

# LifeDrop – Engineering Guidelines

## 1. Project Overview

LifeDrop is a blood donation coordination platform built using React, Next.js, Payload CMS and Tailwind CSS.

The application connects three primary user roles:

- **Donor:** Manages their profile, donation history, eligibility information and responses to blood requests.
- **Receiver:** Creates blood requests, discovers available donors and tracks request fulfilment.
- **Hospital:** Manages blood inventory, donor appointments, clinical assessments, laboratory screening and blood requests.

The application uses a managed Next.js and Payload infrastructure, with platform-provided database, storage and deployment services.

When working on this project, prioritise maintainability, data integrity, security and a consistent user experience. Existing functionality should be preserved unless a change is explicitly requested.

## 2. Technology and Project Structure

The project uses:

- Next.js App Router
- React 19
- TypeScript
- Payload CMS
- Tailwind CSS v4
- pnpm

The main project directories are:

```text
src/
├── app/
│   ├── (frontend)/       # Application pages and layouts
│   └── (payload)/        # Payload admin and API routes
├── collections/          # Payload collection definitions
├── globals/              # Payload global configurations
├── lib/                  # Shared utilities and helpers
├── payload.config.ts     # Payload configuration
└── payload-types.ts      # Generated Payload types

.figma/
└── make/                 # Development and deployment scripts

postman/
└── LifeDrop.postman_collection.json
```

Before changing the project, inspect the relevant source files and understand how the existing implementation works.

Do not introduce a new architecture or replace existing dependencies without a clear technical reason.

## 3. Framework Documentation and Skills

Use the framework versions and configurations installed in the project. Do not assume that conventions from other versions apply.

Before implementing changes:

- Load the `payload-framework` skill for Payload-related work.
- Load `nextjs-docs` when working with routes, pages, components, caching, images or metadata.
- Load `payload-content` before changing or managing Payload documents.
- Load `payload-data-modeling` before modifying collections, fields, relationships, access rules or data structures.
- Load `payload-auth` before changing application authentication.

Read the relevant installed framework documentation when necessary, particularly for APIs that may have changed between versions.

Follow the project's installed versions rather than introducing patterns from unrelated versions.

## 4. Application Architecture

LifeDrop uses Payload as its persistent data and content management layer.

Next.js handles application rendering, server-side operations and API endpoints. Payload manages structured records, authentication, uploads and CMS-managed content.

Use the existing architecture according to the type of work:

- Static interface changes should remain in the frontend.
- Server-side operations should use Server Components, Server Actions or route handlers.
- Persistent application data should be stored in Payload.
- External integrations should run through server-side code.
- Secrets must remain in server-only environment variables.

Do not introduce a separate Express backend, database service or authentication system when the existing infrastructure already supports the requirement.

## 5. Frontend Development

Frontend pages belong in:

`src/app/(frontend)/`

Use the existing shared layouts and components wherever possible.

When implementing a new feature:

1. Inspect the existing component structure.
2. Identify reusable components.
3. Understand the existing data flow.
4. Make changes within the appropriate component boundaries.
5. Verify that existing interactions still work.

### Styling

Tailwind CSS v4 is already configured.

Use Tailwind utilities for component styling. Keep global styles in:

`src/app/(frontend)/styles.css`

Use global CSS for shared theme tokens, resets and genuinely global styling.

Avoid introducing CSS-in-JS, unnecessary inline styles or duplicate component styles when the existing Tailwind setup is sufficient.

### Design Consistency

LifeDrop uses a shared visual identity across its Hospital, Donor and Receiver portals.

Maintain consistency in:

- Typography.
- Colour tokens.
- Spacing.
- Buttons.
- Borders.
- Navigation.
- Icons.
- Interaction states.

Each portal has different operational requirements, so its layout should reflect the needs of its users.

Do not force all three dashboards into identical layouts.

Avoid unnecessary redesigns, decorative components and repetitive card layouts.

When making UI changes, preserve existing functionality and prioritise usability over visual decoration.

### Responsive Behaviour

All new and modified interfaces should work across desktop, tablet and mobile.

Check:

- Layout overflow.
- Navigation behaviour.
- Table readability.
- Modal positioning.
- Chart responsiveness.
- Touch interactions.
- Fixed and sticky elements.

Do not assume that a desktop implementation will work correctly on smaller screens.

## 6. Routing and Rendering

Frontend routes use the Next.js App Router.

Examples:

```text
src/app/(frontend)/page.tsx
src/app/(frontend)/about/page.tsx
src/app/(frontend)/blog/[slug]/page.tsx
```

The existing application routes include:

- `/` – Landing page.
- `/join` – Authentication and role selection.
- `/dashboard` – Authenticated application workspace.
- `/admin` – Payload administration.

The following application endpoints handle operational requests:

- `/api/lifedrop/auth`
- `/api/lifedrop/data`
- `/api/lifedrop/contact`

Keep frontend pages inside the frontend route group.

Do not directly modify:

`src/app/(payload)/`

Payload manages its administration and API route implementation.

### Dynamic Routes

For Payload-backed slug lookups, use the shared `findBySlug()` utility from:

`src/lib/payload.ts`

Use `findByField()` when another field is the intended lookup key.

Handle missing records using Next.js `notFound()` rather than rendering incomplete pages.

Avoid duplicating Payload query logic across route files.

## 7. Payload Configuration and Infrastructure

This project uses the platform-provided Payload integration.

The platform provides database configuration, authentication integration, file storage, deployment runtime and platform-owned secrets.

Keep the existing configuration in:

`src/payload.config.ts`

Use `buildFigmaConfig()`.

Do not replace it with Payload's raw `buildConfig()`.

Do not introduce:

- Separate database adapters.
- Local database configuration.
- Custom database connection strings.
- Dummy Payload secrets.
- Unnecessary storage plugins.
- Alternative Payload authentication plugins.
- Manual database migration infrastructure.

Do not attempt to recreate platform-managed functionality inside application code.

If Payload environment variables are unavailable in an ordinary shell, first check whether the command is running outside the managed application environment.

Do not change the application architecture to work around a missing platform execution context.

## 8. Data Modelling

LifeDrop uses separate collections for operational data and public content.

### Operational Collections

- `users`
- `blood-requests`
- `donor-responses`
- `inventory`
- `appointments`

### Public Content Collections

- `hospitals`
- `campaigns`
- `media`
- `lifedrop-visuals`
- `contact-messages`

Keep domain relationships explicit.

For example:

- Donor responses must reference the relevant donor and blood request.
- Inventory records must belong to the appropriate hospital.
- Appointments must reference the relevant donor and hospital.
- Blood requests must maintain their ownership and assignment information.

Do not replace relationships with duplicated text fields when the application needs independently managed records.

Use the existing generated Payload types from `src/payload-types.ts`.

Do not assume that document IDs are numeric. Preserve the ID types generated by Payload.

### Data Integrity

Validate submitted values on the server.

Client-side validation is useful for user experience, but it must not be the only validation layer.

Enforce important business rules at the Payload collection boundary through access rules, field-level permissions and hooks.

This includes:

- Record ownership.
- Hospital assignments.
- Duplicate donor responses.
- Inventory ownership.
- Appointment relationships.
- Clinical completion requirements.

Do not rely exclusively on frontend restrictions or hidden buttons to protect application data.

## 9. Authentication and RBAC

LifeDrop separates three authentication concerns:

1. Platform access.
2. Payload CMS administration.
3. Application user authentication.

These must remain independent.

Application accounts use the `users` authentication collection.

CMS administration uses the existing `admins` collection.

Never use the CMS administrator collection for public registration or ordinary application accounts.

The application uses the existing authentication helper and HTTP-only `app-session` cookie.

Payload handles password hashing, login, JWT issuance and validation.

Do not introduce a parallel bcrypt implementation, custom password storage or a separate session system.

### Role-Based Access Control

Maintain the existing role boundaries.

**Donor**

- Can manage their own profile.
- Can respond to eligible blood requests.
- Cannot approve their own clinical eligibility.

**Receiver**

- Can manage their own blood requests.
- Can track donor responses.
- Cannot access restricted donor information.

**Hospital**

- Must be verified by authorised CMS staff.
- Can manage its own inventory and assigned operational records.
- Can perform clinical workflows within its permissions.

Hospital verification must not be granted through public registration or ordinary application actions.

Every protected operation must validate the authenticated user and their permissions on the server.

Do not grant application users access to Payload administration.

## 10. Medical and Operational Rules

LifeDrop is a coordination platform, not a replacement for clinical decision-making.

Maintain the separation between donor interest, appointment scheduling, clinical assessment, approval and completed blood collection.

A donor expressing interest does not mean that blood has been donated.

A scheduled appointment does not count as a completed donation.

Only completed and hospital-verified blood collections should contribute to fulfilled blood units.

Clinical eligibility must be assessed by authorised healthcare professionals.

Haemoglobin must be measured and recorded by clinical staff. Donors must not self-certify their haemoglobin levels.

Do not introduce automatic medical approval based solely on numeric thresholds.

Compatibility and crossmatching must remain under qualified hospital supervision.

Do not change medical eligibility intervals or screening requirements without validating the applicable clinical guidance.

## 11. Payload Access and Mutations

All user-facing mutations must validate their inputs.

For Local API operations involving user-facing data:

- Use `overrideAccess: false`.
- Pass the authenticated user where applicable.
- Validate ownership and relationships.
- Restrict fields that should only be controlled by the server or authorised staff.

Public forms may create records where required, but public users must not automatically gain permission to read, update or delete those records.

Protect contact information, internal notes, clinical records and other private data through explicit access rules.

Return structured errors that the frontend can handle.

Avoid exposing internal server errors or sensitive implementation details to users.

## 12. Schema Changes and Data Safety

Treat changes to existing Payload schemas carefully.

Additive changes such as optional fields and new collections are generally straightforward.

However, pause before making changes that could invalidate or destroy existing data.

This includes:

- Deleting fields.
- Renaming fields.
- Changing field types.
- Adding required constraints.
- Adding unique constraints.
- Changing relationship cardinality.
- Bulk-updating existing documents.
- Deleting records.

Before making these changes:

1. Inspect the existing schema.
2. Understand which records depend on it.
3. Identify potential data loss or validation problems.
4. Prepare a migration or preservation approach.
5. Explain the impact.
6. Obtain user confirmation before proceeding.

Use the project's `ask_user_question` mechanism for confirmation where required.

Do not silently change frontend queries or routes to hide a schema migration problem.

Code rollback does not automatically restore Payload document data.

Keep those two forms of version history separate.

## 13. Content and Cache Management

The landing page uses the `lifedrop-home` cache tag.

Changes to campaigns, hospitals, global photography settings and media trigger cache invalidation.

Preserve the existing cache lifecycle.

When introducing new CMS-managed content:

- Decide whether it should be a build-time snapshot or refreshed after Publish.
- Implement the appropriate caching strategy.
- Add collection hooks when fresh published content is required.
- Invalidate affected content when related media changes.
- Handle old and new route keys when slugs change.

Do not assume that a successful build means that cached content is updating correctly.

Verify published content through a fresh production request when cache behaviour changes.

## 14. Image Handling

LifeDrop uses Payload's Media collection for uploaded images.

Use the Payload upload URL (`media.url`) with `next/image`.

The project already includes a custom loader:

`figma-image-loader.ts`

Preserve that loader.

Do not add:

- A separate same-origin media proxy.
- Unnecessary `images.remotePatterns`.
- Duplicate image URL fields.
- Hardcoded frontend image data for CMS-managed content.

When replacing an upload, verify that the updated image renders correctly in all relevant views.

## 15. Security and Environment Variables

Keep private configuration on the server.

Never expose:

- Passwords.
- JWTs.
- Session cookies.
- API secrets.
- OAuth client secrets.
- Private integration tokens.

Do not hardcode secrets or use dummy values to bypass configuration problems.

Third-party integration credentials must be configured through the project's managed environment-variable settings.

Reference them through server-side `process.env` values.

Avoid placing private information in:

- Client components.
- Public environment variables.
- Rendered props.
- Static data.
- Payload documents.

Remember that `NEXT_PUBLIC_` environment variables are exposed to browser code.

Do not print or log secret values.

## 16. External Integrations

Use the existing application architecture for third-party services.

Server-side integrations should run through Next.js server components, Server Actions or route handlers.

Do not introduce a new backend service solely to call an external API.

Before adding a dependency, check whether the project already contains a suitable implementation.

Keep integration credentials server-side and handle failures gracefully.

## 17. Development and Deployment Environment

The application runs in a managed Next.js and Payload environment.

The development server uses `$PORT`, defaulting to `3000` when no port is provided.

Do not start additional development servers unnecessarily.

The following scripts are part of the existing deployment setup:

```text
.figma/make/install
.figma/make/dev
.figma/make/deploy
.figma/make/deploy-preview
```

Preserve these scripts and their executable permissions.

The development server must listen on `$PORT` rather than relying on a hardcoded port.

Use `pnpm` for package management.

Toolchain versions are defined in `.mise.toml`. Do not change the managed Node.js or pnpm versions without a technical reason.

Keep the existing configuration in `next.config.ts`, including preview and deployment settings.

Do not modify platform-managed configuration to work around environment-specific issues. Investigate the underlying problem before changing application infrastructure.

## 18. Development and Verification

The application should be tested after meaningful changes.

For frontend changes:

- Preview every affected route.
- Check for runtime errors.
- Check for build errors.
- Verify responsive behaviour.
- Test the modified interactions.
- Confirm that existing functionality still works.

Server Components cannot directly contain browser event handlers. Use CSS interactions or an appropriate Client Component boundary.

When a Client Component calls a Server Action through `useTransition`, return a serializable result and refresh the client router after a successful operation. Do not place `revalidatePath` inside that action.

### Production Verification

Before considering frontend work complete:

1. Run the appropriate project checks.
2. Run `figma make verify-deploy` if the command is available in the project environment.
3. Inspect the generated production route table.
4. Visit every requested public route.
5. Verify the actual production rendering.
6. Check CMS-managed images.
7. Confirm that requested static pages are not unexpectedly marked dynamic.

A successful build or HTTP 200 response alone does not establish that production rendering is correct.

If the environment prevents a verification command from running, report the exact limitation rather than claiming that verification passed.

## 19. Code Quality and Project Maintenance

Keep implementations straightforward and maintainable.

Prefer existing utilities and shared components over duplicate implementations.

Avoid:

- Unnecessary dependencies.
- Unused files.
- Duplicate components.
- Dead code.
- Placeholder functionality.
- Fake operational data.
- Unnecessary abstraction layers.
- Unrelated changes.
- Temporary debugging code in production.

When modifying a feature, keep the change focused on the relevant functionality.

Do not modify unrelated dashboards, workflows or backend logic.

Keep generated files under their existing ownership. In particular, Payload manages `src/payload-types.ts`.

Do not manually edit generated types.

## 20. Postman and API Testing

The project includes an importable Postman collection:

`postman/LifeDrop.postman_collection.json`

Authentication uses HTTP-only cookies.

When testing protected endpoints:

1. Use the same base URL for login and subsequent requests.
2. Enable Postman's cookie jar.
3. Authenticate through the existing login endpoint.
4. Allow Postman to retain the `app-session` cookie.
5. Reuse the authenticated session for protected requests.

Never commit real passwords, JWTs or session cookies.

## 21. Working Principles

When making changes to LifeDrop, follow these principles:

- Understand the existing implementation before modifying it.
- Preserve working functionality.
- Keep the architecture consistent.
- Validate data at the server boundary.
- Respect authentication and role permissions.
- Keep medical decisions under qualified clinical supervision.
- Avoid unnecessary dependencies and duplicate code.
- Prefer practical solutions over unnecessary abstractions.
- Test the actual user experience, not just the source code.
- Be transparent about incomplete work and environment limitations.

The objective is to maintain LifeDrop as a reliable, secure and maintainable healthcare coordination platform.

Every change should have a clear purpose and should fit the existing architecture.
