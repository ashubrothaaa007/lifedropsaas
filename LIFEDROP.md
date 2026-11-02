# LifeDrop

LifeDrop is a blood donation coordination platform connecting donors, patients and hospitals. The application supports blood requests, donor responses, hospital inventory management and appointment coordination.

This document describes the current application architecture, authentication model, access control, operational workflows and known integration limitations.

## 1. Routes and Rendering

The application uses Next.js for routing and rendering, with Payload CMS handling content management and backend operations.

The main routes are:

- `/` – Prerendered landing page. Payload content is cached using the `lifedrop-home` cache tag.
- `/join` – Static application shell for role selection, login and registration.
- `/dashboard` – Static dashboard shell. Private operational data is retrieved at runtime after server-side authentication.
- `/api/lifedrop/auth` – Authentication endpoints.
- `/api/lifedrop/data` – Operational data endpoints.
- `/api/lifedrop/contact` – Contact form submissions.
- `/admin` – Existing Payload CMS administration interface.

The application uses the platform-managed CMS. Regular application accounts do not have access to the CMS administration interface.

### Landing Page Cache

Changes to campaigns, hospitals, global photography settings and media trigger invalidation of the `lifedrop-home` cache tag.

Media changes also invalidate the home page because its images are managed through uploaded media relationships.

There are currently no individual slug-based detail routes that require additional cache invalidation.

The first request after an Admin update may still receive cached content while Next.js refreshes the cache using the `max` profile. Subsequent visitors receive the updated content.

Cache invalidation requires a request context. CLI-only content changes may therefore require another Publish operation, whereas normal CMS updates trigger the configured hooks within the request lifecycle.

## 2. Authentication and Access Control

LifeDrop uses Payload's `users` authentication collection for application accounts. These accounts are separate from the CMS `admins` collection.

The `createAppAuth('users')` helper delegates password hashing, login, JWT generation and token validation to Payload.

Application sessions use an isolated HTTP-only cookie named `app-session`. This keeps application authentication separate from the CMS session.

The managed runtime registers CMS authentication independently. For application tokens, the authentication helper uses Payload's exported native `JWTAuthentication` verifier as a fallback rather than modifying the CMS authentication strategy.

### Role Permissions

The application supports three operational roles: Donor, Receiver and Hospital.

**Donors**

- Can update their own profiles.
- Can respond to matching blood requests.
- Cannot independently approve their medical eligibility.

**Receivers**

- Can create and track their own blood requests.
- Can view available donor names, blood groups and cities.
- Cannot access donor email addresses or other restricted contact information.

**Hospitals**

- Hospital accounts are unverified when first created.
- Only CMS staff can approve a hospital by setting `hospitalVerified`.
- Verified hospital staff can manage their own blood inventory, assigned requests and appointments.
- Hospital profiles must be linked to their verified account by CMS staff before clinical coordination begins.

Ownership checks, hospital assignments, duplicate donor responses and clinical completion requirements are enforced through Payload collection access rules, hooks and application API validation.

## 3. Data Model

LifeDrop separates operational data from publicly managed content.

### Operational Collections

The following collections support the application's main workflows:

- `users` – Application accounts and role information.
- `blood-requests` – Blood requirements submitted by receivers.
- `donor-responses` – Donor responses to blood requests.
- `inventory` – Hospital blood stock and inventory records.
- `appointments` – Donor appointments and clinical coordination.

### Public Content Collections

- `hospitals` – Hospital information and affiliations.
- `campaigns` – Blood donation campaigns.
- `media` – Uploaded images and other media assets.
- `lifedrop-visuals` – Global visual settings used across the application.

The `contact-messages` collection stores validated contact form submissions. These records are accessible only to CMS staff.

## 4. Demonstration Mode

The application includes a demonstration mode for exploring the Donor, Hospital and Receiver experiences without connecting to real operational workflows.

To access it, open `/join`, select a role and choose **Explore donor / hospital / receiver demo**.

Demo mode uses an in-memory scenario with session storage retaining only the selected role.

All demonstration actions remain local:

- No records are written to the backend.
- No real users are contacted.
- No actual notifications are sent.
- Refreshing the page starts a new demonstration scenario.

Landing page impact statistics and hospital affiliations displayed in the demo are illustrative and should not be treated as verified operational data.

## 5. Medical and Clinical Safeguards

LifeDrop is a blood donation coordination prototype. It is not a medical device, transfusion compatibility checker, emergency service or production-ready clinical system.

Matching donors by blood group and city is only an initial discovery mechanism. It does not establish medical suitability or transfusion compatibility.

Qualified healthcare professionals must assess donor eligibility using applicable medical guidelines. This includes reviewing:

- Medical history.
- Age and weight requirements.
- Previous donation dates and required intervals.
- Haemoglobin levels.
- Other relevant clinical screening criteria.

Haemoglobin must be measured and recorded by authorised clinical staff. Donors cannot independently certify their haemoglobin levels.

A donation cannot be marked complete without the required clinical records, including recorded haemoglobin, staff eligibility confirmation and compatibility attestations.

The application does not automatically approve a donor based on a numerical haemoglobin threshold.

Final transfusion suitability and crossmatching decisions remain the responsibility of qualified hospital personnel.

## 6. Integrations and Technical Boundaries

LifeDrop currently runs on the supported Next.js and Payload managed backend provided by the development platform.

It does not use a separately deployed Express service.

### Authentication and Infrastructure

- Payload handles password hashing and authentication.
- There is no parallel bcrypt implementation or custom authentication system.
- Database and storage configuration are managed by the platform.
- Application authentication uses HTTP-only cookies.

### Notifications and Discovery

Notifications are currently generated as in-app updates and retrieved through manual refresh.

The application does not currently use Socket.IO, browser push notifications or SMS delivery.

Donor discovery currently filters by city. It does not calculate live geographic distance.

Hospital directions open Google Maps using standard map links. A Google Maps API key has not been configured.

### Features Not Yet Integrated

The following capabilities are outside the current implementation:

- Transactional email delivery.
- Password recovery.
- Certified clinical audit infrastructure.
- Rate-limited emergency broadcasting.
- Dedicated Vercel or Render deployment outside the managed platform.

These should be treated as outstanding integration work rather than existing application capabilities.

## 7. Landing Page Assets

The landing page hero uses three Unsplash portraits arranged as an editorial photographic collage with a red and black visual treatment.

It is not an original cinematic group photograph. The current implementation uses externally sourced photography rather than a custom-generated or commissioned image.

## 8. API Testing

An importable Postman collection is available at:

`postman/LifeDrop.postman_collection.json`

Authentication is cookie-based.

When testing the API through Postman:

1. Use the same base URL for authentication and subsequent requests.
2. Enable Postman's cookie jar.
3. Authenticate through the application login endpoint.
4. Allow Postman to retain the `app-session` cookie.
5. Use the authenticated session for protected endpoints.

Do not commit real user passwords, session cookies or JWTs to the repository.
