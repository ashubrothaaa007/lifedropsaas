# LifeDrop

[![Next.js](https://img.shields.io/badge/Next.js-15.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Payload CMS](https://img.shields.io/badge/Payload_CMS-3.2-black?style=flat&logo=payloadcms)](https://payloadcms.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **LifeDrop is a blood donation coordination platform connecting donors, receivers, and hospitals through donor eligibility screening, blood request management, hospital inventory tracking, and donation coordination.**

---

## 🌟 Overview

LifeDrop bridges the critical coordination gap between voluntary blood donors, patients requiring urgent transfusions, and clinical hospital blood banks. Designed with enterprise healthcare standards, LifeDrop enforces clinical eligibility guidelines, protects patient privacy, and provides real-time visibility into blood inventory reserves.

---

## 🚀 Key Modules & Portals

### 🩸 1. Donor Space
- **Clinical Eligibility Assessment**: Interactive screening algorithm checking interval eligibility (56 days for whole blood), age, weight, and health criteria.
- **Request Response System**: Real-time notifications and response mechanisms for urgent community blood requests.
- **Appointment Coordination**: Schedule and manage donation appointments with participating accredited hospitals.
- **Donation History & Badges**: Comprehensive record of donation milestones and personal impact metrics.

### 🏥 2. Hospital Command Center
- **Blood Stock & Inventory Management**: Live inventory tracking across all 8 blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-).
- **Critical Deficit Alerts**: Automatic alerting when any blood group drops below the hospital's minimum safety reserve threshold.
- **Emergency Need Broadcasting**: Single-click broadcast system to notify eligible community donors of acute shortages.
- **Interactive Analytics**: Time-series visualization of requested vs. collected blood units with interactive tooltips and time filters (Daily, Weekly, Monthly).
- **Laboratory Screening & Quarantine**: Mandatory quarantine workflow for unverified units pending infectious disease screening and clinical verification.

### 👥 3. Receiver Portal
- **Urgent Blood Request Creation**: Streamlined request flow specifying patient blood group, units required, hospital, and urgency level.
- **Live Fulfillment Tracking**: Real-time visual progress bar showing committed donor responses vs. required blood units.
- **Available Donor Discovery**: Anonymized donor discovery preserving personal donor privacy while displaying availability and proximity.

---

## 🏗️ Technical Architecture

```text
src/
├── app/
│   ├── (frontend)/             # Next.js App Router (Landing, Join, Dashboard)
│   │   ├── page.tsx            # High-performance landing page
│   │   ├── join/page.tsx       # Authentication & role-selection portal
│   │   ├── dashboard/page.tsx  # Unified role-aware dashboard workspace
│   │   └── api/lifedrop/       # Secure API route handlers (Auth, Data, Contact)
│   └── (payload)/              # Payload CMS admin interface & API routes
├── collections/                # Payload CMS Collection Definitions
│   ├── Users.ts                # Application user accounts (Donor, Receiver, Hospital)
│   ├── BloodRequests.ts        # Transfusion requests & urgency indicators
│   ├── DonorResponses.ts       # Donor commitments & fulfillment tracking
│   ├── Inventory.ts            # Blood inventory units & shelf-life tracking
│   ├── Appointments.ts         # Clinical appointments & donation queue
│   ├── Hospitals.ts            # Verified healthcare institutions
│   ├── Campaigns.ts            # Public blood drives and campaigns
│   └── Media.ts                # Uploaded clinical & platform assets
├── components/
│   ├── lifedrop/               # Domain-specific UI components & portals
│   ├── ui/                     # Reusable design system primitives
│   └── charts/                 # Healthcare data visualizations
├── features/                   # Clean feature domain barrels (donor, hospital, receiver, auth)
├── globals/                    # Platform globals & visual configuration
├── lib/                        # Core utilities, screening logic, & Payload helpers
├── types/                      # TypeScript definitions & domain interfaces
└── payload.config.ts           # Payload CMS configuration
```

---

## 🛡️ Security, RBAC & Medical Safety

- **Role-Based Access Control (RBAC)**: Strict role boundaries for `donor`, `receiver`, and `hospital`. Application accounts are strictly isolated from Payload CMS admin staff.
- **Session Security**: Uses HTTP-only `app-session` cookies with JWT verification to eliminate client-side token exposure.
- **Clinical Integrity**: Donors cannot self-certify clinical hemoglobin or medical clearance; all blood units require hospital staff laboratory screening and physical verification before joining available inventory.
- **Privacy First**: Receiver portals only display anonymized donor records. Donor contact details (email, phone) are never exposed publicly.

---

## 💻 Tech Stack

- **Framework**: Next.js 15+ (App Router, Server Components & Route Handlers)
- **UI Library**: React 19
- **Content & Database Engine**: Payload CMS 3.x
- **Language**: TypeScript 5.7+
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Testing**: Node.js Native Test Runner (`node:test`, `node:assert`)
- **Package Manager**: pnpm

---

## ⚡ Getting Started

### Prerequisites

- Node.js 20.x or higher
- pnpm (or npm / yarn)

### Installation

```bash
# Clone the repository
git clone https://github.com/ashubrothaaa007/lifedropsaas.git

# Navigate into the project directory
cd lifedropsaas

# Install dependencies
pnpm install
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
PAYLOAD_SECRET=your-secure-payload-secret-here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

### Running Locally

```bash
# Start development server
pnpm dev

# Or with npm
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Testing

The repository includes a comprehensive unit test suite validating medical eligibility rules and donation workflow lifecycles:

```bash
# Run automated test suite
node --test tests/donation-eligibility.test.mjs tests/donation-workflow.test.mjs

# Run TypeScript typecheck
npx tsc --noEmit
```

---

## 📄 Postman Collection

An importable Postman collection is provided in `postman/LifeDrop.postman_collection.json` covering:
- Application Authentication (`/api/lifedrop/auth`)
- Operational Data APIs (`/api/lifedrop/data`)
- Contact Submissions (`/api/lifedrop/contact`)

---

## ⚖️ License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
