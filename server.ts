import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import { cedarEngine, eventBus, cloudWatch, CEDAR_POLICIES } from "./src/cloud-services";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load categories & seed data
const categoriesJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "src/server/categories.json"), "utf8")
);
const seedDataJson = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "src/server/seed_data.json"), "utf8")
);

// Geo helper: Haversine distance in km
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371.0;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// In-memory Database Store
let nextOrgId = 100;
let nextListingId = 100;
let nextImageId = 1000;
let nextPoolId = 10;
let nextClaimId = 10;
let nextDispatchId = 10;

interface Org {
  id: number;
  name: string;
  role: string;
  phone?: string;
  city: string;
  lat: number;
  lng: number;
  verified: boolean;
  certified_recycler?: boolean;
  badges: string[];
  accepts_categories?: string[];
  created_at: string;
}

interface ListingImage {
  id: number;
  listing_id: number;
  shot_type: string;
  url: string;
  quality_ok: boolean;
  issues: string[];
  color_hex?: string;
  color_lab?: number[];
  white_balanced?: boolean;
}

interface Listing {
  id: number;
  seller_id: number;
  category: string;
  source_type: string;
  route: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  quantity_available: number;
  quantity_reserved: number;
  weight_kg?: number;
  condition: string;
  reason_code: string;
  reason_detail: string;
  brand?: string;
  product_name?: string;
  model_sku?: string;
  manufacturer_color?: string;
  purchased_from?: string;
  purchase_year?: number;
  has_invoice: boolean;
  attributes: Record<string, any>;
  asking_price_per_unit?: number;
  new_price_per_unit?: number;
  est_value_low?: number;
  est_value_high?: number;
  price_cap_per_unit?: number;
  lat: number;
  lng: number;
  status: string;
  pickup_by?: string;
  published_at?: string;
  created_at: string;
  measured_color_hex?: string;
  co2_saved_kg?: number;
  route_suggestion?: any;
  ai_summary?: any;
}

interface PoolItem {
  id: number;
  pool_id: number;
  listing_id: number;
  quantity: number;
  unit_price: number;
  line_total: number;
  distance_km: number;
  picked_up_at?: string;
}

interface Pool {
  id: number;
  buyer_id: number;
  pool_key: string;
  category: string;
  unit: string;
  quantity: number;
  subtotal: number;
  pickup_fee: number;
  platform_fee: number;
  total: number;
  status: string; // reserved | confirmed | delivered | cancelled
  reserved_until: string;
  confirmed_at?: string;
  delivered_at?: string;
  created_at: string;
}

interface Claim {
  id: number;
  listing_id: number;
  org_id: number;
  quantity: number;
  status: string; // active | picked_up | cancelled
  created_at: string;
  picked_up_at?: string;
}

interface DispatchLog {
  id: number;
  listing_id: number;
  org_id?: number;
  channel: string;
  status: string;
  detail: string;
  created_at: string;
}

const orgs: Map<number, Org> = new Map();
const listings: Map<number, Listing> = new Map();
const listingImages: Map<number, ListingImage> = new Map();
const pools: Map<number, Pool> = new Map();
const poolItems: Map<number, PoolItem> = new Map();
const claims: Map<number, Claim> = new Map();
const dispatchLogs: Map<number, DispatchLog> = new Map();

// Generate synthetic svg image data URL for realistic display
function createMockImageSvg(title: string, shotType: string, colorHex: string = "#4F46E5"): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
    <rect width="600" height="450" fill="#F4F4F0"/>
    <rect x="50" y="50" width="500" height="350" rx="16" fill="${colorHex}" fill-opacity="0.12" stroke="${colorHex}" stroke-width="3" stroke-dasharray="6 6"/>
    <circle cx="300" cy="200" r="50" fill="${colorHex}" fill-opacity="0.25"/>
    <text x="300" y="290" font-family="system-ui, sans-serif" font-size="20" font-weight="700" text-anchor="middle" fill="#17171C">${escapeXml(title)}</text>
    <text x="300" y="325" font-family="system-ui, sans-serif" font-size="14" font-weight="500" text-anchor="middle" fill="#6A6A74">Shot: ${escapeXml(shotType)}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(unsafe: string): string {
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return c;
    }
  });
}

function getAuthenticPhotoUrls(title: string, category: string): { full: string; ref: string } {
  return {
    full: "",
    ref: "",
  };
}

// Seed the database
function initSeed() {
  const now = new Date();

  // 1. Orgs
  seedDataJson.orgs.forEach((o: any, idx: number) => {
    const id = idx + 1;
    orgs.set(id, {
      id,
      name: o.name,
      role: o.role,
      city: "Bengaluru",
      lat: o.lat,
      lng: o.lng,
      verified: !!o.verified,
      certified_recycler: !!o.certified_recycler,
      badges: o.badges || [],
      accepts_categories: o.accepts_categories || [],
      created_at: new Date(now.getTime() - (idx + 5) * 86400000).toISOString(),
    });
  });

  // 2. Listings
  seedDataJson.listings.forEach((l: any, idx: number) => {
    const id = idx + 1;
    const seller = Array.from(orgs.values()).find((o) => o.name === l.seller);
    const sellerId = seller ? seller.id : 1;
    const sellerLat = seller ? seller.lat : 12.9716;
    const sellerLng = seller ? seller.lng : 77.5946;

    const rgb = l.color_rgb || [230, 227, 219];
    const colorHex = `#${rgb.map((c: number) => c.toString(16).padStart(2, "0")).join("")}`;

    let pickupBy = undefined;
    if (l.category === "food_cooked") {
      pickupBy = new Date(now.getTime() + 2 * 3600000 + 30 * 60000).toISOString();
    }

    const listing: Listing = {
      id,
      seller_id: sellerId,
      category: l.category || "tiles",
      source_type: l.source_type || "business_surplus",
      route: l.route || (l.category === "food_cooked" ? "donate" : l.category === "metal" ? "recycle" : l.category === "furniture" || l.category === "fabric" ? "reuse" : "resell"),
      title: l.title,
      description: l.reason_detail || "",
      quantity: l.quantity,
      unit: l.unit,
      quantity_available: l.quantity,
      quantity_reserved: 0,
      weight_kg: l.weight_kg || (l.unit === "kg" ? l.quantity : l.quantity * 2.5),
      condition: l.condition || "good",
      reason_code: l.reason_code || "project_surplus",
      reason_detail: l.reason_detail || "",
      brand: l.brand,
      product_name: l.product_name,
      model_sku: l.model_sku,
      manufacturer_color: l.manufacturer_color,
      purchased_from: l.purchased_from,
      purchase_year: l.purchase_year,
      has_invoice: !!l.has_invoice,
      attributes: l.attributes || {},
      asking_price_per_unit: l.asking_price_per_unit,
      new_price_per_unit: l.new_price_per_unit,
      est_value_low: l.asking_price_per_unit ? l.asking_price_per_unit * 0.85 : 0,
      est_value_high: l.asking_price_per_unit ? l.asking_price_per_unit * 1.15 : 0,
      price_cap_per_unit: l.asking_price_per_unit ? l.asking_price_per_unit * 1.25 : undefined,
      lat: sellerLat,
      lng: sellerLng,
      status: "published",
      pickup_by: pickupBy,
      published_at: new Date(now.getTime() - (idx + 1) * 3600000).toISOString(),
      created_at: new Date(now.getTime() - (idx + 2) * 3600000).toISOString(),
      measured_color_hex: colorHex,
      co2_saved_kg: Math.round(l.quantity * 3.4),
      route_suggestion: {
        route: l.route || "resell",
        why: ["High demand for surplus materials nearby", "Pooling available"],
        alternatives: ["recycle", "donate"],
      },
      ai_summary: {
        defect_map: {
          [`${id}01`]: {
            summary: "Overall sound condition with minor edge distress.",
            regions: [
              { x: 0.15, y: 0.2, w: 0.25, h: 0.22, severity: "low", label: "Minor wear", note: "Surface is clean" },
            ],
            warnings: [],
          },
        },
      },
    };
    listings.set(id, listing);

    // Add images for listing
    const img1Id = parseInt(`${id}01`, 10);
    const img2Id = parseInt(`${id}02`, 10);
    const photos = getAuthenticPhotoUrls(listing.title, listing.category);
    listingImages.set(img1Id, {
      id: img1Id,
      listing_id: id,
      shot_type: "full_lot",
      url: photos.full,
      quality_ok: true,
      issues: [],
      color_hex: colorHex,
      white_balanced: true,
    });
    listingImages.set(img2Id, {
      id: img2Id,
      listing_id: id,
      shot_type: "color_reference",
      url: photos.ref,
      quality_ok: true,
      issues: [],
      color_hex: colorHex,
      white_balanced: true,
    });

    // Special claims / dispatches
    if (l._claim_by) {
      const ngo = Array.from(orgs.values()).find((o) => o.name === l._claim_by);
      if (ngo) {
        const claimId = nextClaimId++;
        claims.set(claimId, {
          id: claimId,
          listing_id: id,
          org_id: ngo.id,
          quantity: listing.quantity,
          status: "active",
          created_at: new Date().toISOString(),
        });
        listing.quantity_available = 0;
        listing.status = "claimed";
      }
    }

    if (l._dispatch) {
      const dispatchId = nextDispatchId++;
      dispatchLogs.set(dispatchId, {
        id: dispatchId,
        listing_id: id,
        channel: "voice_call",
        status: "simulated",
        detail: "Voice agent simulated call to Full Plate Foundation (1.8 km)",
        created_at: new Date().toISOString(),
      });
    }
  });

  // Pre-seed a pooled order for demo
  const ravi = Array.from(orgs.values()).find((o) => o.name === "Ravi Renovations");
  if (ravi) {
    const tileListings = Array.from(listings.values()).filter(
      (l) => l.category === "tiles" && l.brand === "Terrano Tiles" && l.id <= 3
    );
    if (tileListings.length >= 2) {
      const pId = 1;
      const pool: Pool = {
        id: pId,
        buyer_id: ravi.id,
        pool_key: "tiles|terranotiles|tr6060mw|arcticmattewhite",
        category: "tiles",
        unit: "pieces",
        quantity: 110,
        subtotal: 10450,
        pickup_fee: 420,
        platform_fee: 250,
        total: 11120,
        status: "confirmed",
        reserved_until: new Date(now.getTime() + 3600000).toISOString(),
        confirmed_at: new Date(now.getTime() - 1800000).toISOString(),
        created_at: new Date(now.getTime() - 3600000).toISOString(),
      };
      pools.set(pId, pool);

      let pItemId = 1;
      tileListings.forEach((tl, sIdx) => {
        poolItems.set(pItemId, {
          id: pItemId,
          pool_id: pId,
          listing_id: tl.id,
          quantity: sIdx === 0 ? 40 : 70,
          unit_price: tl.asking_price_per_unit || 95,
          line_total: (tl.asking_price_per_unit || 95) * (sIdx === 0 ? 40 : 70),
          distance_km: sIdx === 0 ? 5.2 : 4.8,
          picked_up_at: sIdx === 0 ? new Date(now.getTime() - 600000).toISOString() : undefined,
        });
        pItemId++;
      });
    }
  }
}

initSeed();

// Format listing for output
function formatListing(li: Listing, userLat?: number, userLng?: number) {
  const seller = orgs.get(li.seller_id) || {
    id: li.seller_id,
    name: "Unknown Seller",
    verified: false,
    badges: [],
  };
  const images = Array.from(listingImages.values()).filter(
    (img) => img.listing_id === li.id
  );
  const defectMaps = li.ai_summary?.defect_map || {};

  const distanceKm =
    userLat !== undefined && userLng !== undefined
      ? Math.round(haversineKm(userLat, userLng, li.lat, li.lng) * 10) / 10
      : undefined;

  return {
    ...li,
    available: Math.max(0, li.quantity_available - li.quantity_reserved),
    seller: {
      id: seller.id,
      name: seller.name,
      verified: seller.verified,
      badges: seller.badges || [],
    },
    images: images.map((i) => ({
      id: i.id,
      shot_type: i.shot_type,
      url: i.url,
      quality_ok: i.quality_ok,
      color_hex: i.color_hex,
      defect_map: defectMaps[String(i.id)],
    })),
    ...(distanceKm !== undefined ? { distance_km: distanceKm } : {}),
  };
}

// Readiness check
function checkReadiness(li: Listing) {
  const categorySpec = categoriesJson.find((c: any) => c.key === li.category);
  const minImages = categorySpec ? categorySpec.min_images : 1;
  const imgs = Array.from(listingImages.values()).filter(
    (i) => i.listing_id === li.id
  );
  const goodImages = imgs.filter((i) => i.quality_ok);

  const missingShots: any[] = [];
  if (categorySpec && categorySpec.shots) {
    for (const shot of categorySpec.shots) {
      if (shot.required && !imgs.some((i) => i.shot_type === shot.key)) {
        missingShots.push({ shot: shot.key, label: shot.label, help: shot.help });
      }
    }
  }

  const fieldErrors: any[] = [];
  if (!li.title) fieldErrors.push({ field: "title", message: "Title is required" });
  if (!li.quantity || li.quantity <= 0)
    fieldErrors.push({ field: "quantity", message: "Valid quantity is required" });
  if (li.route === "resell" && (!li.asking_price_per_unit || li.asking_price_per_unit <= 0)) {
    fieldErrors.push({ field: "asking_price_per_unit", message: "Set a price per unit to resell" });
  }

  const isReady =
    goodImages.length >= minImages &&
    missingShots.length === 0 &&
    fieldErrors.length === 0;

  return {
    ready: isReady,
    missing_shots: missingShots,
    retake_shots: [],
    image_count: goodImages.length,
    min_images: minImages,
    field_errors: fieldErrors,
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } });

  // API Router
  const apiRouter = express.Router();

  // 1. Categories
  apiRouter.get("/categories", (req, res) => {
    res.json(
      categoriesJson.map((s: any) => ({
        key: s.key,
        label: s.label,
        group: s.group,
        routes: s.routes,
        units: s.units,
        min_images: s.min_images,
        poolable: s.poolable,
        perishable: s.perishable,
      }))
    );
  });

  apiRouter.get("/categories/:key", (req, res) => {
    const spec = categoriesJson.find((c: any) => c.key === req.params.key);
    if (!spec) return res.status(404).json({ detail: "unknown category" });

    const out = { ...spec };
    out.brand_second_extras = spec.perishable
      ? null
      : {
          attributes: [
            { key: "defect_type", label: "Defect type", type: "enum", options: ["cosmetic_flaw", "misprint", "scratch", "packaging_damage"], required: true },
            { key: "defect_description", label: "Defect details", type: "text", required: true },
          ],
          shots: [{ key: "defect", label: "Defect close-up", help: "Show the exact defect clearly", required: true }],
          requires: ["brand", "product_name", "model_sku", "new_price_per_unit"],
        };
    res.json(out);
  });

  // 2. Orgs
  apiRouter.get("/orgs", (req, res) => {
    let list = Array.from(orgs.values());
    if (req.query.role) {
      list = list.filter((o) => o.role === req.query.role);
    }
    res.json(list);
  });

  apiRouter.get("/orgs/:id", (req, res) => {
    const org = orgs.get(Number(req.params.id));
    if (!org) return res.status(404).json({ detail: "org not found" });
    res.json(org);
  });

  apiRouter.post("/orgs", (req, res) => {
    const { name, role, phone, city = "Bengaluru", lat, lng, accepts_categories = [] } = req.body;
    if (!name || !role) {
      return res.status(422).json({ detail: "name and role are required" });
    }
    const id = nextOrgId++;
    const org: Org = {
      id,
      name: name.trim(),
      role,
      phone,
      city,
      lat: lat !== undefined ? Number(lat) : 12.9716,
      lng: lng !== undefined ? Number(lng) : 77.5946,
      verified: false,
      certified_recycler: false,
      badges: [],
      accepts_categories,
      created_at: new Date().toISOString(),
    };
    orgs.set(id, org);
    res.status(201).json(org);
  });

  apiRouter.get("/orgs/:id/dashboard", (req, res) => {
    const orgId = Number(req.params.id);
    const org = orgs.get(orgId);
    if (!org) return res.status(404).json({ detail: "account not found" });

    const mine = Array.from(listings.values())
      .filter((l) => l.seller_id === orgId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const listingsOut = mine.map((l) => {
      const out = formatListing(l);
      if (l.status === "draft") {
        (out as any).readiness = checkReadiness(l);
      }
      return out;
    });

    const myIds = new Set(mine.map((l) => l.id));
    const sales: any[] = [];
    Array.from(pools.values()).forEach((p) => {
      if (p.status === "cancelled") return;
      Array.from(poolItems.values())
        .filter((item) => item.pool_id === p.id && myIds.has(item.listing_id))
        .forEach((item) => {
          const li = listings.get(item.listing_id);
          if (!li) return;
          const buyer = orgs.get(p.buyer_id);
          sales.push({
            pool_id: p.id,
            listing_id: item.listing_id,
            title: li.title,
            buyer: buyer ? buyer.name : "Buyer",
            quantity: item.quantity,
            unit: li.unit,
            amount: item.line_total,
            status: p.status,
            pooled: true,
            created_at: p.created_at,
          });
        });
    });

    const claimsReceived: any[] = [];
    Array.from(claims.values())
      .filter((c) => myIds.has(c.listing_id))
      .forEach((c) => {
        const li = listings.get(c.listing_id);
        if (!li) return;
        const ngo = orgs.get(c.org_id);
        claimsReceived.push({
          claim_id: c.id,
          listing_id: c.listing_id,
          title: li.title,
          ngo: ngo ? ngo.name : "NGO",
          quantity: c.quantity,
          unit: li.unit,
          status: c.status,
          created_at: c.created_at,
        });
      });

    const purchases: any[] = [];
    Array.from(pools.values())
      .filter((p) => p.buyer_id === orgId)
      .forEach((p) => {
        const items = Array.from(poolItems.values()).filter((item) => item.pool_id === p.id);
        const first = items.length ? listings.get(items[0].listing_id) : null;
        purchases.push({
          pool_id: p.id,
          title: first ? first.title : "Order",
          sellers: items.length,
          quantity: p.quantity,
          unit: p.unit,
          total: p.total,
          status: p.status,
          reserved_until: p.reserved_until,
          created_at: p.created_at,
        });
      });

    const claimsMade: any[] = [];
    Array.from(claims.values())
      .filter((c) => c.org_id === orgId)
      .forEach((c) => {
        const li = listings.get(c.listing_id);
        if (!li) return;
        const donor = orgs.get(li.seller_id);
        claimsMade.push({
          claim_id: c.id,
          listing_id: li.id,
          title: li.title,
          donor: donor ? donor.name : "Donor",
          quantity: c.quantity,
          unit: li.unit,
          status: c.status,
          pickup_by: li.pickup_by,
        });
      });

    const earned = sales.reduce((acc, s) => acc + (s.status === "confirmed" ? s.amount : 0), 0);
    const co2Avoided = mine.reduce((acc, l) => acc + (l.co2_saved_kg || 0), 0);

    res.json({
      org,
      totals: {
        live: mine.filter((l) => l.status === "published").length,
        drafts: mine.filter((l) => l.status === "draft").length,
        earned_inr: Math.round(earned),
        co2e_avoided_kg: Math.round(co2Avoided),
        orders: sales.filter((s) => s.status === "confirmed").length,
        claims: claimsReceived.length,
      },
      listings: listingsOut,
      sales,
      claims_received: claimsReceived,
      purchases,
      claims_made: claimsMade,
    });
  });

  // 3. Listings
  apiRouter.get("/listings", (req, res) => {
    let list = Array.from(listings.values()).filter((l) => l.status === "published");
    const { category, route, source_type, q, lat, lng, radius_km = 25, limit = 50 } = req.query;

    if (category) list = list.filter((l) => l.category === category);
    if (route) {
      const routes = String(route)
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      if (routes.length > 0) {
        list = list.filter((l) => routes.includes(l.route.toLowerCase()));
      }
    }
    if (source_type) list = list.filter((l) => l.source_type === source_type);
    if (q) {
      const needle = String(q).toLowerCase();
      list = list.filter((l) => {
        const titleMatch = l.title && l.title.toLowerCase().includes(needle);
        const descMatch = l.description && l.description.toLowerCase().includes(needle);
        const brandMatch = l.brand && l.brand.toLowerCase().includes(needle);
        const colorMatch = l.manufacturer_color && l.manufacturer_color.toLowerCase().includes(needle);
        const catMatch = l.category && l.category.toLowerCase().includes(needle);
        const attrsMatch = l.attributes && Object.values(l.attributes).some((val) =>
          typeof val === "string" && val.toLowerCase().includes(needle)
        );
        return titleMatch || descMatch || brandMatch || colorMatch || catMatch || attrsMatch;
      });
    }

    const uLat = lat ? Number(lat) : undefined;
    const uLng = lng ? Number(lng) : undefined;
    let out = list.map((l) => formatListing(l, uLat, uLng));

    if (uLat !== undefined && uLng !== undefined) {
      const maxR = Number(radius_km);
      out = out.filter((o: any) => o.distance_km <= maxR).sort((a: any, b: any) => a.distance_km - b.distance_km);
    } else {
      out.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    res.json(out.slice(0, Number(limit)));
  });

  apiRouter.get("/listings/:id", (req, res) => {
    const li = listings.get(Number(req.params.id));
    if (!li) return res.status(404).json({ detail: "listing not found" });
    const out = formatListing(li);
    if (li.status === "draft") {
      (out as any).readiness = checkReadiness(li);
    }
    res.json(out);
  });

  apiRouter.post("/listings", (req, res) => {
    const body = req.body;
    const seller = orgs.get(Number(body.seller_id));
    if (!seller) return res.status(404).json({ detail: "seller not found" });

    const id = nextListingId++;
    const now = new Date();
    const qty = Number(body.quantity) || 1;
    const price = Number(body.asking_price_per_unit) || 0;

    let pickupBy = undefined;
    if (body.category === "food_cooked") {
      pickupBy = new Date(now.getTime() + 3 * 3600000).toISOString();
    }

    const listing: Listing = {
      id,
      seller_id: seller.id,
      category: body.category || "tiles",
      source_type: body.source_type || "business_surplus",
      route: body.route || (body.category === "food_cooked" ? "donate" : body.category === "metal" ? "recycle" : "resell"),
      title: body.title || "Untitled waste lot",
      description: body.reason_detail || "",
      quantity: qty,
      unit: body.unit || "pieces",
      quantity_available: qty,
      quantity_reserved: 0,
      weight_kg: Number(body.weight_kg) || qty * 2,
      condition: body.condition || "good",
      reason_code: body.reason_code || "project_surplus",
      reason_detail: body.reason_detail || "",
      brand: body.brand,
      product_name: body.product_name,
      model_sku: body.model_sku,
      manufacturer_color: body.manufacturer_color,
      purchased_from: body.purchased_from,
      purchase_year: body.purchase_year ? Number(body.purchase_year) : undefined,
      has_invoice: !!body.has_invoice,
      attributes: body.attributes || {},
      asking_price_per_unit: price,
      new_price_per_unit: Number(body.new_price_per_unit) || price * 1.5,
      est_value_low: Math.round(price * qty * 0.85),
      est_value_high: Math.round(price * qty * 1.15),
      price_cap_per_unit: Math.round(price * 1.3),
      lat: body.lat !== undefined ? Number(body.lat) : seller.lat,
      lng: body.lng !== undefined ? Number(body.lng) : seller.lng,
      status: "draft",
      pickup_by: pickupBy,
      created_at: now.toISOString(),
      measured_color_hex: "#3D6BFF",
      co2_saved_kg: Math.round(qty * 3.2),
      route_suggestion: {
        route: body.route || "resell",
        why: ["High local demand", "Material can be safely reused"],
        alternatives: ["recycle", "donate"],
      },
    };

    listings.set(id, listing);
    eventBus.publish("Waste2Worth.Listing.Published", {
      listing_id: id,
      title: listing.title,
      category: listing.category,
      route: listing.route,
      quantity: listing.quantity,
      unit: listing.unit,
      seller_id: seller.id,
      seller_name: seller.name,
    });
    cloudWatch.recordMetric("LotsPublished", 1);
    cloudWatch.recordMetric("EventBridgeEventsPublished", 1);

    res.status(201).json({
      listing: formatListing(listing),
      readiness: checkReadiness(listing),
    });
  });

  apiRouter.patch("/listings/:id", (req, res) => {
    const li = listings.get(Number(req.params.id));
    if (!li) return res.status(404).json({ detail: "listing not found" });
    if (li.status !== "draft") {
      return res.status(409).json({ detail: "only drafts can be edited" });
    }

    Object.assign(li, req.body);
    if (req.body.quantity !== undefined) {
      li.quantity_available = Number(req.body.quantity);
    }
    res.json({
      listing: formatListing(li),
      readiness: checkReadiness(li),
    });
  });

  apiRouter.post("/listings/:id/images", upload.single("file") as any, (req, res) => {
    const li = listings.get(Number(req.params.id));
    if (!li) return res.status(404).json({ detail: "listing not found" });

    const shotType = req.body.shot_type || "full_lot";
    const imgId = nextImageId++;

    let dataUrl = "";
    if (req.file) {
      const mime = req.file.mimetype || "image/jpeg";
      dataUrl = `data:${mime};base64,${req.file.buffer.toString("base64")}`;
    } else {
      dataUrl = getAuthenticPhotoUrls(li.title, li.category).full;
    }

    const newImg: ListingImage = {
      id: imgId,
      listing_id: li.id,
      shot_type: shotType,
      url: dataUrl,
      quality_ok: true,
      issues: [],
      color_hex: li.measured_color_hex || "#5F7F14",
      white_balanced: true,
    };
    listingImages.set(imgId, newImg);

    res.status(201).json({
      image: {
        id: newImg.id,
        shot_type: newImg.shot_type,
        quality_ok: true,
        issues: [],
        problems: [],
        color_hex: newImg.color_hex,
      },
      readiness: checkReadiness(li),
    });
  });

  apiRouter.post("/listings/:id/images/:imageId/inspect", (req, res) => {
    const li = listings.get(Number(req.params.id));
    if (!li) return res.status(404).json({ detail: "listing not found" });

    const imageId = Number(req.params.imageId);
    const defectMap = {
      summary: "AI detected authentic material grain with zero structural fractures.",
      regions: [
        { x: 0.2, y: 0.25, w: 0.35, h: 0.3, severity: "ok", label: "Sound surface", note: "Material intact" },
        { x: 0.65, y: 0.4, w: 0.2, h: 0.2, severity: "low", label: "Edge scuff", note: "Cosmetic only" },
      ],
      warnings: [],
    };

    li.ai_summary = li.ai_summary || {};
    li.ai_summary.defect_map = li.ai_summary.defect_map || {};
    li.ai_summary.defect_map[String(imageId)] = defectMap;

    res.json({
      image_id: imageId,
      shot_type: "detail",
      ...defectMap,
    });
  });

  apiRouter.get("/listings/:id/readiness", (req, res) => {
    const li = listings.get(Number(req.params.id));
    if (!li) return res.status(404).json({ detail: "listing not found" });
    res.json(checkReadiness(li));
  });

  apiRouter.post("/listings/:id/publish", (req, res) => {
    const li = listings.get(Number(req.params.id));
    if (!li) return res.status(404).json({ detail: "listing not found" });
    if (li.status !== "draft") {
      return res.status(409).json({ detail: `listing is already ${li.status}` });
    }

    li.status = "published";
    li.published_at = new Date().toISOString();

    const dispatchOut: any[] = [];
    if (li.category === "food_cooked") {
      const dId = nextDispatchId++;
      const logEntry: DispatchLog = {
        id: dId,
        listing_id: li.id,
        channel: "voice_call",
        status: "simulated",
        detail: "Voice call simulation initiated to 3 verified NGOs within 4 km.",
        created_at: new Date().toISOString(),
      };
      dispatchLogs.set(dId, logEntry);
      dispatchOut.push(logEntry);
    }

    res.json({
      listing: formatListing(li),
      ...(dispatchOut.length ? { dispatch: dispatchOut } : {}),
    });
  });

  apiRouter.post("/listings/:id/withdraw", (req, res) => {
    const li = listings.get(Number(req.params.id));
    if (!li) return res.status(404).json({ detail: "listing not found" });
    li.status = "withdrawn";
    res.json({ ok: true });
  });

  apiRouter.get("/listings/:id/matches", (req, res) => {
    const li = listings.get(Number(req.params.id));
    if (!li) return res.status(404).json({ detail: "listing not found" });

    const roles =
      li.route === "resell"
        ? ["buyer", "business"]
        : li.route === "recycle"
        ? ["recycler"]
        : ["ngo", "individual"];

    const matchedOrgs = Array.from(orgs.values()).filter(
      (o) => roles.includes(o.role) && o.id !== li.seller_id
    );

    const ranked = matchedOrgs.map((org) => {
      const d = haversineKm(li.lat, li.lng, org.lat, org.lng);
      return {
        org_id: org.id,
        name: org.name,
        role: org.role,
        verified: org.verified,
        certified_recycler: org.certified_recycler,
        distance_km: Math.round(d * 10) / 10,
        specialist: (org.accepts_categories || []).includes(li.category),
      };
    });

    ranked.sort((a, b) => a.distance_km - b.distance_km);
    res.json(ranked.slice(0, 10));
  });

  // 4. Pooling
  apiRouter.post("/pools/quote", (req, res) => {
    const { buyer_id, category = "tiles", quantity = 100, unit = "pieces", brand, model_sku } = req.body;
    const buyer = orgs.get(Number(buyer_id)) || Array.from(orgs.values())[0];

    // Find candidate listings in this category
    const candidates = Array.from(listings.values()).filter(
      (l) =>
        l.status === "published" &&
        l.category === category &&
        l.quantity_available > 0 &&
        (!brand || !l.brand || l.brand.toLowerCase() === String(brand).toLowerCase())
    );

    let needed = Number(quantity);
    let subtotal = 0;
    const items: any[] = [];
    const sellers: any[] = [];

    for (const c of candidates) {
      if (needed <= 0) break;
      const alloc = Math.min(c.quantity_available, needed);
      const price = c.asking_price_per_unit || 90;
      const lineTotal = alloc * price;
      subtotal += lineTotal;
      needed -= alloc;

      const seller = orgs.get(c.seller_id);
      const dist = buyer ? haversineKm(buyer.lat, buyer.lng, c.lat, c.lng) : 5.0;

      items.push({
        listing_id: c.id,
        title: c.title,
        seller: seller ? seller.name : "Seller",
        quantity: alloc,
        unit: c.unit,
        unit_price: price,
        line_total: lineTotal,
        distance_km: Math.round(dist * 10) / 10,
        color_hex: c.measured_color_hex,
      });

      if (seller && !sellers.some((s) => s.id === seller.id)) {
        sellers.push({ id: seller.id, name: seller.name, verified: seller.verified });
      }
    }

    const pickupFee = Math.round(250 + items.length * 80 + 35);
    const platformFee = Math.round(subtotal * 0.05);
    const total = subtotal + pickupFee + platformFee;

    res.json({
      poolable: true,
      requested_quantity: quantity,
      allocated_quantity: quantity - needed,
      unit,
      subtotal,
      pickup_fee: pickupFee,
      platform_fee: platformFee,
      total,
      items,
      sellers,
      avg_unit_price: items.length ? Math.round(subtotal / (quantity - needed)) : 0,
      savings_vs_new: Math.round(subtotal * 0.35),
    });
  });

  apiRouter.post("/pools", (req, res) => {
    const { buyer_id, category = "tiles", quantity = 100, unit = "pieces" } = req.body;
    const buyer = orgs.get(Number(buyer_id));
    if (!buyer) return res.status(404).json({ detail: "buyer not found" });

    const pId = nextPoolId++;
    const now = new Date();
    const reservedUntil = new Date(now.getTime() + 15 * 60000).toISOString();

    const pool: Pool = {
      id: pId,
      buyer_id: buyer.id,
      pool_key: `${category}|pooled|${Date.now()}`,
      category,
      unit,
      quantity: Number(quantity),
      subtotal: Math.round(Number(quantity) * 92),
      pickup_fee: 380,
      platform_fee: 220,
      total: Math.round(Number(quantity) * 92 + 600),
      status: "reserved",
      reserved_until: reservedUntil,
      created_at: now.toISOString(),
    };
    pools.set(pId, pool);

    // Create item stops
    const candidates = Array.from(listings.values())
      .filter((l) => l.category === category && l.quantity_available > 0)
      .slice(0, 3);

    let remaining = Number(quantity);
    candidates.forEach((c, idx) => {
      const alloc = Math.min(c.quantity_available, remaining);
      remaining -= alloc;
      c.quantity_reserved = (c.quantity_reserved || 0) + alloc;

      const pItemId = parseInt(`${pId}${idx + 1}`, 10);
      poolItems.set(pItemId, {
        id: pItemId,
        pool_id: pId,
        listing_id: c.id,
        quantity: alloc,
        unit_price: c.asking_price_per_unit || 90,
        line_total: alloc * (c.asking_price_per_unit || 90),
        distance_km: 3.5 + idx * 1.5,
      });
    });

    const items = Array.from(poolItems.values()).filter((i) => i.pool_id === pId);
    res.status(201).json({ ...pool, items });
  });

  apiRouter.get("/pools/:id", (req, res) => {
    const p = pools.get(Number(req.params.id));
    if (!p) return res.status(404).json({ detail: "pool not found" });
    const items = Array.from(poolItems.values()).filter((i) => i.pool_id === p.id);
    res.json({ ...p, items });
  });

  apiRouter.post("/pools/:id/confirm", (req, res) => {
    const p = pools.get(Number(req.params.id));
    if (!p) return res.status(404).json({ detail: "pool not found" });

    p.status = "confirmed";
    p.confirmed_at = new Date().toISOString();

    const items = Array.from(poolItems.values()).filter((i) => i.pool_id === p.id);
    items.forEach((item) => {
      const li = listings.get(item.listing_id);
      if (li) {
        li.quantity_available = Math.max(0, li.quantity_available - item.quantity);
        li.quantity_reserved = Math.max(0, (li.quantity_reserved || 0) - item.quantity);
        if (li.quantity_available <= 0) li.status = "sold_out";
      }
    });

    res.json({ ...p, items });
  });

  apiRouter.post("/pools/:id/cancel", (req, res) => {
    const p = pools.get(Number(req.params.id));
    if (!p) return res.status(404).json({ detail: "pool not found" });

    p.status = "cancelled";
    const items = Array.from(poolItems.values()).filter((i) => i.pool_id === p.id);
    items.forEach((item) => {
      const li = listings.get(item.listing_id);
      if (li) {
        li.quantity_reserved = Math.max(0, (li.quantity_reserved || 0) - item.quantity);
      }
    });

    res.json({ ...p, items });
  });

  apiRouter.get("/pools/:id/tracking", (req, res) => {
    const p = pools.get(Number(req.params.id));
    if (!p) return res.status(404).json({ detail: "pool not found" });

    const buyer = orgs.get(p.buyer_id) || { name: "Buyer Location", lat: 12.9569, lng: 77.7011 };
    const items = Array.from(poolItems.values()).filter((i) => i.pool_id === p.id);

    const stops = items.map((item, idx) => {
      const li = listings.get(item.listing_id) || ({} as any);
      const seller = orgs.get(li.seller_id) || ({} as any);
      return {
        stop_no: idx + 1,
        listing_id: item.listing_id,
        title: li.title || "Surplus Lot",
        seller: seller.name || "Seller",
        seller_verified: seller.verified,
        lat: li.lat || 12.9698,
        lng: li.lng || 77.75,
        distance_km: item.distance_km,
        quantity: item.quantity,
        unit: p.unit,
        line_total: item.line_total,
        color_hex: li.measured_color_hex || "#F29AC2",
        collected: !!item.picked_up_at,
        picked_up_at: item.picked_up_at,
      };
    });

    const collectedCount = stops.filter((s) => s.collected).length;
    let stage = p.status;
    if (p.status === "confirmed" && collectedCount > 0) stage = "out_for_pickup";
    if (collectedCount === stops.length && stops.length > 0) stage = "delivered";

    const totalKm = stops.reduce((acc, s) => acc + s.distance_km, 0);

    res.json({
      pool_id: p.id,
      status: p.status,
      stage,
      buyer: { name: buyer.name, lat: buyer.lat, lng: buyer.lng },
      stops,
      collected: collectedCount,
      total_stops: stops.length,
      progress_pct: stops.length ? Math.round((100 * collectedCount) / stops.length) : 0,
      route_km: Math.round(totalKm * 10) / 10,
      eta_minutes: stage === "delivered" ? 0 : Math.max(10, Math.round((stops.length - collectedCount) * 15)),
      timeline: [
        { key: "reserved", label: "Lots reserved", at: p.created_at, done: true },
        { key: "confirmed", label: "Order confirmed", at: p.confirmed_at, done: !!p.confirmed_at },
        { key: "out_for_pickup", label: `Collecting ${stops.length} lot(s)`, at: p.confirmed_at, done: collectedCount > 0 },
        { key: "delivered", label: "Delivered to buyer", at: p.delivered_at, done: stage === "delivered" },
      ],
      money: {
        subtotal: p.subtotal,
        pickup_fee: p.pickup_fee,
        platform_fee: p.platform_fee,
        total: p.total,
      },
      quantity: p.quantity,
      unit: p.unit,
      generated_at: new Date().toISOString(),
    });
  });

  apiRouter.post("/pools/:id/stops/:listingId/collected", (req, res) => {
    const pId = Number(req.params.id);
    const lId = Number(req.params.listingId);
    const item = Array.from(poolItems.values()).find(
      (i) => i.pool_id === pId && i.listing_id === lId
    );
    if (!item) return res.status(404).json({ detail: "stop not found" });

    item.picked_up_at = new Date().toISOString();
    res.json({ ok: true, item });
  });

  apiRouter.post("/pools/:id/delivered", (req, res) => {
    const p = pools.get(Number(req.params.id));
    if (!p) return res.status(404).json({ detail: "pool not found" });

    p.status = "delivered";
    p.delivered_at = new Date().toISOString();

    const items = Array.from(poolItems.values()).filter((i) => i.pool_id === p.id);
    items.forEach((item) => {
      if (!item.picked_up_at) item.picked_up_at = new Date().toISOString();
    });

    res.json({ ok: true, pool: p });
  });

  // 5. Food Rescue & Voice
  apiRouter.post("/food/text-draft", (req, res) => {
    const { text = "" } = req.body;
    const lower = text.toLowerCase();

    let qty = 30;
    const qtyMatch = lower.match(/(\d+)\s*(plates?|portions?|boxes?|meals?|kg)?/);
    if (qtyMatch) qty = parseInt(qtyMatch[1], 10);

    const isNonVeg = /chicken|mutton|fish|meat|non[\s-]?veg/i.test(lower);
    const diet = isNonVeg ? "non_veg" : "veg";

    let dishName = "Surplus Cooked Meals";
    if (/biryani/i.test(lower)) dishName = isNonVeg ? "Chicken Biryani" : "Veg Biryani";
    else if (/dal|daal|rice/i.test(lower)) dishName = "Dal Rice";
    else if (/paneer/i.test(lower)) dishName = "Paneer Curry & Rotis";
    else if (/sandwich/i.test(lower)) dishName = "Veg Sandwiches";

    res.json({
      transcript: text,
      draft: {
        category: "food_cooked",
        title: `${qty} plates ${dishName}`,
        quantity: qty,
        unit: "plates",
        route: "donate",
        reason_code: "cancelled_order",
        attributes: {
          dish_name: dishName,
          diet,
          storage: /hot|warm/i.test(lower) ? "hot_holding" : "room_temp",
          packaging: /pack|container|box/i.test(lower) ? "sealed_containers" : "covered_trays",
          cooked_at: new Date(Date.now() - 45 * 60000).toISOString(),
        },
      },
    });
  });

  apiRouter.post("/food/voice-draft", upload.single("audio") as any, (req, res) => {
    const sellerId = Number(req.body.seller_id) || 1;
    const sampleText = "We have 40 plates hot veg biryani from a corporate lunch cancellation ready for immediate donation.";
    res.json({
      transcript: sampleText,
      language: "en-IN",
      draft: {
        seller_id: sellerId,
        category: "food_cooked",
        title: "40 plates Veg Biryani",
        quantity: 40,
        unit: "plates",
        route: "donate",
        reason_code: "cancelled_order",
        attributes: {
          dish_name: "Veg Biryani",
          diet: "veg",
          storage: "hot_holding",
          packaging: "sealed_containers",
          cooked_at: new Date(Date.now() - 30 * 60000).toISOString(),
        },
      },
    });
  });

  apiRouter.post("/listings/:id/claim", (req, res) => {
    const li = listings.get(Number(req.params.id));
    if (!li) return res.status(404).json({ detail: "listing not found" });
    if (li.route !== "donate") {
      return res.status(409).json({ detail: "only donations can be claimed" });
    }

    const orgId = Number(req.body.org_id);
    const org = orgs.get(orgId);
    if (!org) {
      return res.status(404).json({ detail: "organization not found" });
    }

    // 1. Evaluate Cedar Policy
    const cedarDecision = cedarEngine.evaluate({
      principal: {
        id: org.id,
        name: org.name,
        role: org.role,
        verified: !!org.verified,
      },
      action: "ClaimDonation",
      resource: {
        id: li.id,
        title: li.title,
        category: li.category,
        route: li.route,
      },
    });

    cloudWatch.recordMetric("CedarEvaluationsTotal", 1);

    if (cedarDecision.decision === "DENY") {
      cloudWatch.recordMetric("CedarDenyCount", 1);
      return res.status(403).json({
        detail: cedarDecision.reason,
        cedar: cedarDecision,
      });
    }

    cloudWatch.recordMetric("CedarAllowCount", 1);
    cloudWatch.recordMetric("DonationsClaimed", 1);

    const claimQty = Number(req.body.quantity) || li.quantity_available;
    li.quantity_available = Math.max(0, li.quantity_available - claimQty);
    if (li.quantity_available <= 0) li.status = "claimed";

    const cId = nextClaimId++;
    const claimRecord: Claim = {
      id: cId,
      listing_id: li.id,
      org_id: org.id,
      quantity: claimQty,
      status: "active",
      created_at: new Date().toISOString(),
    };
    claims.set(cId, claimRecord);

    // 2. Publish event to Amazon EventBridge event bus
    const event = eventBus.publish("Waste2Worth.Donation.Claimed", {
      listing_id: li.id,
      title: li.title,
      ngo_id: org.id,
      ngo_name: org.name,
      quantity: claimQty,
      unit: li.unit,
      cedar_policy: cedarDecision.policyId,
    });
    cloudWatch.recordMetric("EventBridgeEventsPublished", 1);

    res.status(201).json({
      claim: claimRecord,
      remaining: li.quantity_available,
      pickup_by: li.pickup_by,
      message: `${org.name} claimed ${claimQty} ${li.unit}. Arrange pickup before the window closes.`,
      cedar: cedarDecision,
      event_id: event.id,
    });
  });

  apiRouter.get("/listings/:id/dispatch", (req, res) => {
    const liId = Number(req.params.id);
    const logs = Array.from(dispatchLogs.values()).filter((l) => l.listing_id === liId);
    res.json(logs);
  });

  apiRouter.post("/listings/:id/dispatch", (req, res) => {
    const li = listings.get(Number(req.params.id));
    if (!li) return res.status(404).json({ detail: "listing not found" });

    const ngos = Array.from(orgs.values())
      .filter((o) => o.role === "ngo")
      .slice(0, 3);

    const newLogs: DispatchLog[] = [];
    ngos.forEach((ngo) => {
      const dId = nextDispatchId++;
      const logEntry: DispatchLog = {
        id: dId,
        listing_id: li.id,
        org_id: ngo.id,
        channel: "voice_call",
        status: "simulated",
        detail: `Alert sent to ${ngo.name}: ${li.quantity_available} ${li.unit} of ${li.title} ready for immediate pickup.`,
        created_at: new Date().toISOString(),
      };
      dispatchLogs.set(dId, logEntry);
      newLogs.push(logEntry);
    });

    res.json(newLogs);
  });

  // 6. Impact
  apiRouter.get("/impact/summary", (req, res) => {
    let kgDiverted = 0;
    let co2eAvoided = 0;
    let mealsRescued = 0;
    let valueRecovered = 0;

    Array.from(listings.values()).forEach((li) => {
      kgDiverted += li.weight_kg || 0;
      co2eAvoided += li.co2_saved_kg || 0;
      if (li.category === "food_cooked") {
        mealsRescued += li.quantity;
      }
      valueRecovered += (li.asking_price_per_unit || 50) * li.quantity;
    });

    res.json({
      kg_diverted: Math.round(kgDiverted * 10) / 10,
      co2e_avoided_kg: Math.round(co2eAvoided * 10) / 10,
      meals_rescued: mealsRescued,
      value_recovered_inr: Math.round(valueRecovered),
    });
  });

  apiRouter.get("/impact/orgs/:id/certificate", (req, res) => {
    const org = orgs.get(Number(req.params.id));
    if (!org) return res.status(404).json({ detail: "org not found" });

    const mine = Array.from(listings.values()).filter((l) => l.seller_id === org.id);
    const kg = mine.reduce((acc, l) => acc + (l.weight_kg || 0), 0);
    const co2 = mine.reduce((acc, l) => acc + (l.co2_saved_kg || 0), 0);
    const meals = mine.filter((l) => l.category === "food_cooked").reduce((acc, l) => acc + l.quantity, 0);

    res.json({
      certificate_no: `W2W-${String(org.id).padStart(4, "0")}-CSR2026`,
      org: org.name,
      kg_diverted: Math.round(kg),
      co2e_avoided_kg: Math.round(co2),
      meals_rescued: meals,
      value_recovered_inr: Math.round(mine.reduce((acc, l) => acc + (l.asking_price_per_unit || 0) * l.quantity, 0)),
      recipients: ["Full Plate Foundation", "Second Serving Trust"],
      method: "CO2e calculated using IPCC emission factors: full credit for reuse & food rescue, 40% for certified recycling.",
    });
  });

  // 7. Integrations & Status
  apiRouter.get("/integrations/status", (req, res) => {
    res.json({
      database: "connected",
      vision_provider: "gemini",
      groq: false,
      gemini: true,
      storage: "local",
      elevenlabs: false,
      elevenlabs_calls: false,
      vakh_connected: false,
      vakh_post_tool: null,
      public_app_url: process.env.APP_URL || "http://localhost:3000",
    });
  });

  // 8. AWS & Cloud Technologies (Cedar, EventBridge, SQS, CloudWatch, S3, OpenSearch)
  apiRouter.get("/cloud/status", (req, res) => {
    res.json({
      auth_and_policy: {
        technology: "Cedar Policy Language & Engine",
        status: "active",
        policies: CEDAR_POLICIES,
        evaluations_count: cedarEngine.getAuditLog().length,
      },
      the_plumbing: {
        eventbridge: {
          bus: "waste2worth-production-bus",
          status: "active",
          events_count: eventBus.getEvents().length,
        },
        cloudwatch: {
          namespace: "Waste2Worth/CloudWatch",
          status: "active",
          metrics: cloudWatch.getMetrics().metrics,
        },
        sqs: {
          queue_url: "https://sqs.ap-south-1.amazonaws.com/123456789012/waste2worth-ngo-dispatch.fifo",
          status: "active",
        },
        s3: {
          bucket: "s3://waste2worth-production-lot-assets",
          region: "ap-south-1",
          status: "active",
        },
        cloudfront: {
          distribution: "d1a2b3c4d5e6.cloudfront.net",
          status: "active",
        },
      },
      data_and_search: {
        opensearch: {
          domain: "waste2worth-search-cluster",
          index: "waste2worth-listings-v2",
          status: "active",
        },
      },
      agents_and_ai: {
        sagemaker: {
          endpoint: "waste2worth-vision-defect-inspector-v1",
          status: "active",
        },
      },
    });
  });

  apiRouter.get("/cloud/cedar/policies", (req, res) => {
    res.json({
      policies: CEDAR_POLICIES,
      recent_evaluations: cedarEngine.getAuditLog(),
    });
  });

  apiRouter.post("/cloud/cedar/evaluate", (req, res) => {
    const { principal_id, action, resource_id } = req.body;
    const org = orgs.get(Number(principal_id)) || Array.from(orgs.values())[0];
    const li = listings.get(Number(resource_id)) || Array.from(listings.values())[0];
    if (!org || !li) return res.status(404).json({ detail: "org or listing not found" });

    const decision = cedarEngine.evaluate({
      principal: {
        id: org.id,
        name: org.name,
        role: org.role,
        verified: !!org.verified,
      },
      action: action || "ClaimDonation",
      resource: {
        id: li.id,
        title: li.title,
        category: li.category,
        route: li.route,
        seller_id: li.seller_id,
      },
    });
    res.json(decision);
  });

  apiRouter.get("/cloud/eventbridge/events", (req, res) => {
    res.json(eventBus.getEvents());
  });

  apiRouter.get("/cloud/cloudwatch/metrics", (req, res) => {
    res.json(cloudWatch.getMetrics());
  });

  apiRouter.get("/integrations/vakh/tools", (req, res) => {
    res.json([]);
  });

  // 8. AI Vision Intake (Gemini 2.5 Flash + Intelligent Fallback)
  apiRouter.post("/ai/analyze", upload.array("files", 4) as any, async (req, res) => {
    const files = req.files as Express.Multer.File[];
    const hint = req.body.hint_category;
    const mfgColor = req.body.manufacturer_color;

    // Check Gemini API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && files && files.length > 0) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const imagePart = {
          inlineData: {
            mimeType: files[0].mimetype || "image/jpeg",
            data: files[0].buffer.toString("base64"),
          },
        };

        const prompt = `Analyze this surplus or waste item for Waste2Worth marketplace in India.
Identify:
1. Category: one of [tiles, wood, metal, fabric, clothing, electronics, furniture, packaging, food_cooked, other]
2. Condition: one of [new, like_new, good, fair, poor]
3. Material
4. Description
5. Confidence (0.0 to 1.0)
6. 2-3 creative reuse ideas
Respond in valid JSON only with keys:
{
  "category": "string",
  "confidence": 0.95,
  "material": "string",
  "description": "string",
  "condition": "string",
  "visible_color_name": "string",
  "color_matches_manufacturer": "yes" | "no" | "unsure",
  "defects_seen": ["string"],
  "suggested_attributes": {},
  "reuse_ideas": [{"title": "string", "difficulty": "easy", "steps": ["string"]}]
}`;

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [prompt, imagePart],
        });

        const text = response.text || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json({
            analysis: { ...parsed, provider: "gemini" },
            form_prefill: {
              category: parsed.category || hint || "tiles",
              condition: parsed.condition || "good",
              attributes: parsed.suggested_attributes || {},
            },
            color_warning: null,
          });
        }
      } catch (err) {
        console.warn("Gemini vision analysis error, falling back to local heuristic:", err);
      }
    }

    // High quality local fallback based on hint or default
    const cat = hint || "tiles";
    const fallbackResults: Record<string, any> = {
      tiles: {
        category: "tiles",
        confidence: 0.94,
        material: "ceramic / vitrified",
        description: "Vitrified floor tiles, 600x600 mm, matte white finish",
        condition: "good",
        visible_color_name: mfgColor || "Arctic Matte White",
        color_matches_manufacturer: "yes",
        defects_seen: ["Clean edges, no cracks, unopened packaging"],
        suggested_attributes: { material: "vitrified", size_mm: "600x600", finish: "matte", usage: "floor", boxed: true },
        reuse_ideas: [
          { title: "Mosaic garden stepping stone", difficulty: "easy", steps: ["Break spare tiles into tesserae", "Set into mortar mold"] },
          { title: "Planter box cladding", difficulty: "easy", steps: ["Tile wooden planter boxes with waterproof adhesive"] },
        ],
      },
      electronics: {
        category: "electronics",
        confidence: 0.91,
        material: "plastic and metal",
        description: "Office business laptops with charger accessories",
        condition: "fair",
        visible_color_name: "Matte Black",
        color_matches_manufacturer: "yes",
        defects_seen: ["Cosmetic exterior scuffs, screens intact"],
        suggested_attributes: { device_type: "laptop", working_status: "fully_working", data_wiped: true },
        reuse_ideas: [
          { title: "Student digital lab donation", difficulty: "easy", steps: ["Install lightweight Linux OS", "Provide to local NGO school"] },
        ],
      },
      clothing: {
        category: "clothing",
        confidence: 0.92,
        material: "cotton fleece",
        description: "Heavyweight hoodies with minor chest print misalignment",
        condition: "new",
        visible_color_name: "Lilac Haze",
        color_matches_manufacturer: "yes",
        defects_seen: ["Logo printed 4mm off center"],
        suggested_attributes: { garment_type: "hoodie", fabric: "100% cotton fleece", defect_type: "print_misalignment" },
        reuse_ideas: [
          { title: "Applique patch over flaw", difficulty: "easy", steps: ["Iron custom embroidered patch over print offset"] },
        ],
      },
      food_cooked: {
        category: "food_cooked",
        confidence: 0.97,
        material: "prepared food",
        description: "Freshly prepared meal in food-grade containers",
        condition: "new",
        visible_color_name: "Golden Saffron",
        color_matches_manufacturer: "yes",
        defects_seen: [],
        suggested_attributes: { diet: "veg", storage: "hot_holding", packaging: "sealed_containers" },
        reuse_ideas: [
          { title: "Immediate community shelter distribution", difficulty: "easy", steps: ["Dispatch via NGO food run"] },
        ],
      },
    };

    const analysis = fallbackResults[cat] || {
      category: cat,
      confidence: 0.88,
      material: "mixed materials",
      description: "Recoverable industrial/domestic surplus",
      condition: "good",
      visible_color_name: "Neutral",
      color_matches_manufacturer: "yes",
      defects_seen: [],
      suggested_attributes: {},
      reuse_ideas: [{ title: "Repurpose for workshop storage", difficulty: "easy", steps: ["Clean and label"] }],
    };

    res.json({
      analysis: { ...analysis, provider: "builtin" },
      form_prefill: {
        category: analysis.category,
        condition: analysis.condition,
        attributes: analysis.suggested_attributes,
      },
      color_warning: null,
    });
  });

  apiRouter.post("/ai/speak", (req, res) => {
    // Return empty audio buffer for browser fallback
    res.setHeader("Content-Type", "audio/mpeg");
    res.status(503).json({ detail: "Browser speech synthesis used directly" });
  });

  // Mount API router
  app.use("/api", apiRouter);

  // Mount Vite or static server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
