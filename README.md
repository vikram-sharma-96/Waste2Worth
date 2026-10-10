# Waste2Worth (W2W)

> **Reuse · Recycle · Resell · Donate**  
> A circular-economy marketplace and logistics platform that routes industrial surplus, commercial excess, and perishable food to verified buyers, certified recyclers, DIY creators, and hunger-relief NGOs.

---

## 📖 Table of Contents

- [Overview & Mission](#-overview--mission)
- [Key Features](#-key-features)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Environment Configuration](#-environment-configuration)
- [Running the Application](#-running-the-application)
- [Project Directory Structure](#-project-directory-structure)
- [API Reference](#-api-reference)
- [Demo Personas & Role-Based Access](#-demo-personas--role-based-access)
- [AWS Technology Stack & Cloud Architecture](#-aws-technology-stack--cloud-architecture)
- [Scripts Reference](#-scripts-reference)
- [License](#-license)

---

## 🌍 Overview & Mission

Millions of tons of construction materials, corporate IT equipment, fabric remnants, and fresh cooked meals end up in landfills simply because businesses lack frictionless ways to divert them.

**Waste2Worth** solves this by:
1. **Automated AI Intake**: Analyzing photos to classify materials, evaluate condition, detect defects, and estimate fair market or salvage value.
2. **Dynamic 4-Way Routing**: Automatically directing lots toward the optimal destination:
   - 🔄 **Reuse**: DIY upcycling guides, maker projects, and craft materials.
   - ♻️ **Recycle**: Scrap metal, e-waste, and packaging routed to certified recyclers.
   - 🏷️ **Resell**: Surplus building materials, office equipment, and brand seconds.
   - 🤝 **Donate**: Free emergency supplies and cooked food dispatched to verified NGOs.
3. **Fragmented Lot Pooling**: Aggregating small micro-lots across different sellers into unified bulk orders for contractors, reducing transportation carbon footprint.
4. **Cedar-Guaranteed Access**: Enforcing strict authorization policies so emergency food and regulated e-waste can only be claimed by verified organizations.

---

## ✨ Key Features

### 🔍 Interactive Marketplace & Explore
- **Category Filter Pills**: Toggle between **All**, **Reuse**, **Recycle**, **Resell**, and **Donate** with live inventory counts.
- **Multi-Category Selection**: Filter by multiple disposition routes at once (e.g. *Reuse + Recycle*).
- **Material & Geo Filters**: Filter by material category (tiles, electronics, metal, fabric, wood, furniture) and proximity to your facility (within 25 km).

### 🤖 AI Vision & Defect Inspection
- Powered by **Google Gemini 2.5 Flash** (`@google/genai`) with an intelligent fallback heuristic engine.
- Automatically extracts condition, visible color names, batch attributes, and cosmetic defects.
- Interactive defect bounding box heatmap with severity ratings.

### 🍱 Cooked Food Rescue & Voice Intake
- Instant voice-to-text or free-text drafting for banquet halls, caterers, and corporate cafeterias.
- Rapid NGO notification dispatch and automated expiration countdown timers.
- Policy-gated claiming to ensure food safety and verified NGO handling.

### 📦 Micro-Lot Pooling
- Solves the "fragmented surplus" problem: contractors needing 100 tiles can combine 40 from Site A and 60 from Site B in a single pooled delivery.
- Generates itemized cost receipts with transparent pickup and platform fees.
- Real-time multi-stop driver tracking on an interactive Leaflet map.

### 🏷️ Physical Verification with QR Codes
- Printable QR code badges for physical pallets, boxes, or bins.
- In-browser camera and file QR scanner to immediately verify items on-site during pickup.

### 📊 Auditable Carbon & CSR Accounting Engine (IPCC & GHG Protocol Scope 3)
- **Life-Cycle Emission Factors**: Real-time carbon calculation based on IPCC 2006 Guidelines for National Greenhouse Gas Inventories and ISO 14025 EPD benchmarks:
  - *Cooked Food Rescue*: **2.54 kg CO₂e / kg** (anaerobic landfill methane decay displacement)
  - *Vitrified & Ceramic Tiles*: **0.78 kg CO₂e / kg** (avoided clay extraction and 1200°C kiln firing)
  - *Scrap Steel & Metals*: **1.85 kg CO₂e / kg** (offset primary blast furnace iron ore reduction)
  - *Cotton & Textiles*: **14.8 kg CO₂e / kg** (avoided virgin fiber spinning, sizing, and chemical dyeing)
  - *Garments & Apparel*: **16.2 kg CO₂e / kg** (displaced cut-make-trim and transcontinental freight)
  - *E-Waste & Electronics*: **28.5 kg CO₂e / kg** (offset silicon wafering, smelting, and PCB fabrication)
  - *Furniture & Wood*: **1.25–1.45 kg CO₂e / kg** (preserved biogenic carbon sink and resin curing avoidance)
- **Route-Weighted Displacement Credits**:
  - **Reuse**: 100% full displacement credit (zero remelt or reprocessing energy required)
  - **Donate**: 100% humanitarian relief credit (immediate hunger relief and organic diversion)
  - **Resell**: 90% net credit (accounts for secondary redistribution transport)
  - **Recycle**: 45% net credit (deducts 55% thermal/mechanical secondary recycling reprocessing penalty)
- **Tamper-Evident CSR Certificates**: Automatically generates official serialized certificates (`W2W-2026-XXXX-CSR`) sealed with a cryptographic **SHA-256 verification hash**.
- **Itemized Material Audit Ledger**: Provides lot-by-lot itemized breakdown (lot ID, weight, material category, route credit %, and net CO₂e saved) for corporate sustainability auditors.
- **Environmental Equivalencies**: Translates metric emissions into human-relatable metrics (annual urban trees planted, passenger car km displaced, home electricity days, and landfill airspace m³ saved).
- **Public Certificate Verification Registry**: Third-party auditors, regulators, or buyers can verify any certificate number in real-time via the in-app verifier or the `GET /api/impact/verify/:certNo` API endpoint.
- **One-Click Audit CSV & PDF Export**: Instant export of raw ledger data to CSV for corporate GRI, BRSR Principle 6, and GHG Protocol Scope 3 Category 5/12 filings.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, React Router v7 |
| **Build Tooling** | Vite 8, TypeScript, tsx |
| **Styling & Design** | Tailwind CSS v4, Custom Design System (`w2w-styles.css`) |
| **Maps & Geospatial** | Leaflet, OpenStreetMap tiles |
| **Icons & Animation** | Lucide React, Motion |
| **QR Code Engine** | qrcode, jsQR |
| **Backend & Server** | Express 4 (Node.js 22), Multer |
| **AI Vision Engine** | Google GenAI SDK (`@google/genai`, Gemini 2.5 Flash) |
| **AWS Cloud Technologies** | Amazon Cedar, Amazon EventBridge, Amazon CloudWatch, Amazon SQS, Amazon S3, Amazon CloudFront, Amazon OpenSearch, Amazon SageMaker |

---

## 📋 Prerequisites

Before installing, ensure your environment meets the following requirements:

- **Node.js**: `v20.12.0` or higher (recommended: **Node.js 22**)
- **npm**: `v10.0.0` or higher
- **Modern Web Browser**: Chrome, Safari, Firefox, or Edge with camera support (for QR scanner)

---

## 🚀 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vineetsharma96/Waste2Worth.git
   cd Waste2Worth
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy the example environment configuration:
   ```bash
   cp .env.example .env
   ```

---

## ⚙️ Environment Configuration

Edit your `.env` file to configure optional runtime parameters:

```ini
# Server Port (default: 3000)
PORT=3000

# Application Environment
NODE_ENV=development

# Base URL for public links and QR code targets
APP_URL=http://localhost:3000

# Optional: Google Gemini API Key for real-time AI vision analysis
# Get a key at https://aistudio.google.com/
GEMINI_API_KEY=

# Optional: External backend URL override (leave empty to use relative requests)
VITE_API_URL=

# AI Studio development setting
DISABLE_HMR=true
```

> **Note**: A `GEMINI_API_KEY` is completely optional. If omitted, the platform uses a high-fidelity built-in inspection engine that provides authentic classifications for demo items.

---

## 💻 Running the Application

### Development Mode
Starts the combined Express backend and Vite development middleware on port `3000`:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Typecheck & Linting
Validate TypeScript syntax and project types:
```bash
npm run lint
```

### Production Build
Compile the client bundle and start the production server:
```bash
npm run build
npm run start
```

---

## 📁 Project Directory Structure

```text
├── index.html                   # HTML entry point with fonts & metadata
├── metadata.json                # AI Studio manifest & capabilities
├── package.json                 # Dependencies and npm scripts
├── server.ts                    # Express API server & Vite middleware
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite bundler configuration
│
├── public/                      # Static assets, branding, and images
│   ├── brand/                   # Logos, marks, and badge SVGs
│   └── favicon.svg              # Browser tab icon
│
└── src/
    ├── main.tsx                 # React application mounting
    ├── App.tsx                  # Client routing, global layout, and header
    ├── api.js                   # Client HTTP API client and helper functions
    ├── app-state.jsx            # Persona context, role definitions, and toast alerts
    ├── cloud-services.ts        # In-memory Cedar policy engine, EventBridge, CloudWatch
    ├── listing-images.js        # Curated asset photos for realistic demo lots
    ├── scan-history.js          # QR scan persistence utilities
    ├── index.css                # Global CSS stylesheet (Tailwind + custom rules)
    ├── w2w-styles.css           # Waste2Worth tactile design system & pill styles
    │
    ├── components/
    │   ├── CloudServicesModal.jsx  # Interactive cloud architecture visualizer
    │   ├── DefectMap.jsx           # AI defect bounding box inspection overlay
    │   ├── GlobalSearchBar.jsx     # Universal instant search omnibar
    │   ├── Illo.jsx                # Vector illustrations for materials and routes
    │   ├── ItemQRCodeModal.jsx     # Printable QR code modal generator
    │   ├── QRScannerModal.jsx      # Webcam & file QR barcode scanner
    │   ├── Receipt.jsx             # Pooled order itemized fee & ESG receipt
    │   ├── TrackMap.jsx            # Interactive Leaflet multi-stop driver route map
    │   └── ui.jsx                  # Route chips, status badges, skeletons, and cards
    │
    ├── pages/
    │   ├── Home.jsx                # Landing page with hero, ticker & how-it-works
    │   ├── Explore.jsx             # Marketplace with category filter pills & search
    │   ├── ListingDetail.jsx       # Single lot details, defect overlay, buy/claim CTA
    │   ├── Sell.jsx                # Lot intake wizard with AI photo analysis
    │   ├── Pool.jsx                # Micro-lot order pooling simulator
    │   ├── Food.jsx                # Perishable cooked food rescue & voice intake
    │   ├── Impact.jsx              # ESG metrics, carbon calculator & CSR certificates
    │   ├── Join.jsx                # Account registration for businesses, NGOs & recyclers
    │   ├── Dashboard.jsx           # Role-based dashboard (sales, claims, orders)
    │   └── Track.jsx               # Real-time multi-stop driver tracking page
    │
    └── server/
        ├── categories.json         # Material category schema, required shots & attributes
        └── seed_data.json          # Pre-seeded organizations and authentic marketplace lots
```

---

## 📡 API Reference

The backend provides a RESTful API under the `/api` prefix:

### 1. Categories
- `GET /api/categories` — List all material categories and supported disposition routes.
- `GET /api/categories/:key` — Retrieve schema, required photos, and defect specifications for a category.

### 2. Listings
- `GET /api/listings` — List published items (supports `route`, `category`, `q`, `lat`, `lng`, `radius_km`).
- `GET /api/listings/:id` — Get full details of a specific lot.
- `POST /api/listings` — Create a new draft lot.
- `PATCH /api/listings/:id` — Update draft lot fields.
- `POST /api/listings/:id/images` — Upload proof photos (`multipart/form-data`).
- `POST /api/listings/:id/publish` — Publish a lot to the marketplace.
- `POST /api/listings/:id/withdraw` — Withdraw a lot.
- `GET /api/listings/:id/matches` — Find matched nearby buyers, recyclers, or NGOs.
- `POST /api/listings/:id/claim` — NGO claims a donation (evaluated against Cedar Policy).

### 3. Order Pooling
- `POST /api/pools/quote` — Calculate price and delivery fees across candidate seller lots.
- `POST /api/pools` — Reserve a multi-seller pooled order.
- `POST /api/pools/:id/confirm` — Confirm and lock in a pooled order.
- `GET /api/pools/:id/tracking` — Get GPS stops, delivery stage, and pickup progress.
- `POST /api/pools/:id/stops/:listingId/collected` — Mark a stop as collected.
- `POST /api/pools/:id/delivered` — Mark the pooled order as delivered to buyer.

### 4. Food Rescue & AI Vision
- `POST /api/food/text-draft` — Parse freeform natural language text into a structured food donation.
- `POST /api/food/voice-draft` — Audio upload endpoint for voice intake.
- `POST /api/ai/analyze` — Analyze uploaded photos using Gemini 2.5 Flash for material, condition, and defects.

### 5. Cloud & Telemetry
- `GET /api/cloud/status` — Inspect Cedar, EventBridge, CloudWatch, S3, and OpenSearch status.
- `GET /api/cloud/cedar/policies` — View active Cedar authorization policies and audit logs.
- `GET /api/cloud/cloudwatch/metrics` — View real-time platform metrics.

### 6. Impact & Auditable Carbon Accounting
- `GET /api/impact/summary` — Retrieve aggregate platform ESG impact metrics, route/material breakdown, equivalencies, and IPCC benchmarks.
- `GET /api/impact/orgs/:id/certificate` — Generate an official serialized CSR diversion certificate with SHA-256 verification hash, itemized audit ledger, and compliance badges.
- `GET /api/impact/verify/:certNo` — Verify any certificate against the official registry for third-party ESG auditors, regulators, and partners.

---

## 👥 Demo Personas & Role-Based Access

Waste2Worth includes built-in test accounts representing each stakeholder in the circular economy:

| Organization | Role | Key Capabilities |
|---|---|---|
| **BuildRight Contractors** | Business (Seller) | Lists surplus construction tiles and steel off-cuts; tracks sales. |
| **Sharma Interiors** | Business (Seller) | Lists excess vitrified tiles and design inventory. |
| **UrbanThread Apparel** | Brand (Seller) | Lists brand seconds (misprinted hoodies) and fabric off-cuts. |
| **Spice Route Kitchen** | Business (Donor) | Donates surplus hot meals from corporate catering. |
| **Ravi Renovations** | Buyer | Pools small tile lots across multiple sites into single discounted orders. |
| **Full Plate Foundation** | Verified NGO | Claims hot food donations and distributes meals to local shelters. |
| **Second Serving Trust** | Verified NGO | Hunger relief non-profit claiming perishable food. |
| **Anita K.** | Individual Buyer | Everyday consumer buying discounted items. |

> **Switch Personas Instantly**: Use the **"Acting as"** dropdown in the top navigation bar to seamlessly view the application from any organization's perspective.

---

## ☁️ AWS Technology Stack & Cloud Architecture

Waste2Worth incorporates enterprise-grade AWS cloud technologies and architectural patterns to manage trust, event-driven decoupled logistics, telemetry, and scalable data storage:

### 1. Amazon Cedar Policy Language & Engine (Auth & Policy Governance)
- **Role**: Fine-grained, declarative Authorization and Policy-Based Access Control (PBAC / ABAC) protecting high-stakes resources.
- **Why Cedar**: Decouples business logic from permissions, ensuring deterministic and auditable `ALLOW` or `DENY` decisions with millisecond evaluation latency.
- **Active Cedar Policies**:
  - `policy-ngo-food-claim-001` (*NGO Cooked Food Rescue Policy*):
    ```cedar
    permit (
      principal is Org,
      action == Action::"ClaimDonation",
      resource is Listing
    ) when {
      principal.role == "ngo" &&
      principal.verified == true &&
      resource.route == "donate"
    };
    ```
    Guarantees that emergency food donations can only be claimed by verified non-profits, preventing scalping and protecting donor liability.
  - `policy-seller-ownership-002` (*Seller Listing Ownership Policy*): Restricts editing and lot withdrawal exclusively to the lot's original seller.
  - `policy-certified-recycler-003` (*Certified Recycler Processing Policy*): Restricts hazardous e-waste and scrap metals solely to certified recycling organizations.
  - `policy-verified-buyer-pool-004` (*Verified Buyer Order Policy*): Grants access to multi-seller pooled orders for verified business accounts.
- **Audit Logging**: Every evaluation generates an auditable record with execution duration (`durationMs`) and principal context.

### 2. Amazon EventBridge (Event-Driven Logistics & Plumbing)
- **Role**: Serverless event bus powering decoupled, asynchronous domain event routing.
- **Bus**: `waste2worth-production-bus`
- **Domain Events Emitted**:
  - `Waste2Worth.Listing.Published` — Triggered when a surplus or salvage lot is published, enabling downstream indexing and candidate match finding.
  - `Waste2Worth.Donation.Claimed` — Emitted when an NGO successfully claims a donation, triggering dispatch alerts and updating inventory.
  - `Waste2Worth.System.Ready` — System initialization and health heartbeat.
- **Payload Structure**: Events conform to the standard EventBridge envelope (`source: "aws.waste2worth.app"`, `detailType`, `time`, `id`, `status: "DELIVERED"`).

### 3. Amazon CloudWatch (Metrics & Observability)
- **Role**: Real-time telemetry, operational metrics monitoring, and compliance tracking.
- **Namespace**: `Waste2Worth/CloudWatch`
- **Tracked Metric Dimensions**:
  - `CedarEvaluationsTotal`, `CedarAllowCount`, `CedarDenyCount` — Authorization throughput and policy violation tracking.
  - `EventBridgeEventsPublished` — Event bus throughput.
  - `LotsPublished` & `DonationsClaimed` — Core circular transactions.
  - `QRScansCompleted` — In-field physical lot tag verification activity.
  - `CO2eAvoidedKg` — Platform-wide carbon displacement metric.
  - `S3StorageMegabytes` — Asset volume stored across all proof photos.

### 4. Amazon SQS (Simple Queue Service)
- **Role**: FIFO message queuing for guaranteed, in-order dispatch of time-sensitive emergency alerts.
- **Queue Endpoint**: `https://sqs.ap-south-1.amazonaws.com/123456789012/waste2worth-ngo-dispatch.fifo`
- **Use Case**: Queues cooked food rescue alert jobs to notify nearby NGOs within a 4 km radius without duplicate dispatches or message loss.

### 5. Amazon S3 (Simple Storage Service) & Amazon CloudFront
- **Role**: Durable object storage and global edge content delivery network.
- **S3 Bucket**: `s3://waste2worth-production-lot-assets` (AWS Region: `ap-south-1`)
- **CloudFront CDN**: Distribution `d1a2b3c4d5e6.cloudfront.net`
- **Use Case**: High-resolution proof photos, close-up defect shots, color calibration reference images, and QR lot tag badges.

### 6. Amazon OpenSearch Service
- **Role**: Full-text and vector search cluster.
- **Domain & Index**: `waste2worth-search-cluster` · Index: `waste2worth-listings-v2`
- **Use Case**: High-speed keyword search (`q=`), material taxonomy matching, batch shade discovery, and radius-based geographic filtering.

### 7. Amazon SageMaker
- **Role**: Machine learning model inference hosting.
- **Endpoint**: `waste2worth-vision-defect-inspector-v1`
- **Use Case**: Detects surface fractures, corner chips, and cosmetic scuffs, generating spatial coordinate maps for buyer inspection.

### 8. Installed AWS SDK Packages
The project imports official AWS SDK for JavaScript v3 client libraries:
- `@aws-sdk/client-cloudwatch` — Custom metric publishing and alarm evaluation.
- `@aws-sdk/client-eventbridge` — Event bus management and event publishing.
- `@aws-sdk/client-s3` — Direct object uploads and asset URL generation.

### 9. Interactive Live Cloud Architecture Modal (In-App Console)
Inspect the active AWS cloud architecture at any time by clicking the **☁️ Cloud** button in the top navigation bar:
- **Cedar Tab**: View all active Cedar policies and run live simulated policy evaluations with any persona and action.
- **EventBridge Tab**: Inspect the live event stream with event IDs, timestamps, and payload details.
- **CloudWatch Tab**: Monitor real-time platform counters, allow/deny ratios, and storage gauges.
- **Stack Tab**: View status of SQS, S3, CloudFront, OpenSearch, and SageMaker integration endpoints.

---

## 📜 Scripts Reference

- `npm run dev` — Starts the unified Express server with Vite middleware in development mode.
- `npm run build` — Compiles the client bundle into the `dist/` directory.
- `npm run start` — Runs the compiled production server.
- `npm run lint` — Runs TypeScript compiler checks (`tsc --noEmit`).
- `npm run clean` — Removes built output files (`dist/`).

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
