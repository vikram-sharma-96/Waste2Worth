import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import { usePersona } from "../app-state";
import { Empty, ErrorBox, ListingCard, ROUTE_META } from "../components/ui";
import QRScannerModal from "../components/QRScannerModal";

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const { persona } = usePersona();
  const [cats, setCats] = useState([]);
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);
  const [q, setQ] = useState(params.get("q") || "");
  const [showScanner, setShowScanner] = useState(false);
  const route = params.get("route") || "";
  const category = params.get("category") || "";
  const near = params.get("near") === "1";

  useEffect(() => { api.categories().then(setCats).catch(() => {}); }, []);

  useEffect(() => {
    setQ(params.get("q") || "");
  }, [params]);

  useEffect(() => {
    const t = setTimeout(() => {
      setError(null);
      api.listings({
        route, category, q: params.get("q") || "",
        ...(near && persona ? { lat: persona.lat, lng: persona.lng, radius_km: 25 } : {}),
      }).then(setItems).catch((e) => { setError(e); setItems([]); });
    }, 150);
    return () => clearTimeout(t);
  }, [params, persona, route, category, near]);

  const set = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next, { replace: true });
  };

  return (
    <div className="container">
      <div className="page-head row between" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <p className="eyebrow">Explore</p>
          <h1>What's up for grabs.</h1>
          <p>Everything here has been checked: proof photos, where it came from, and why it's being passed on.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowScanner(true)}
          style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
          title="Scan a waste lot QR code to immediately open its verified details"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          Scan QR Code
        </button>
      </div>

      <div className="card card-pad" style={{ marginBottom: 24 }}>
        <div className="row between" style={{ flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
            <button className="filter-chip" aria-pressed={!route} onClick={() => set("route", "")}>All</button>
            {Object.entries(ROUTE_META).map(([k, m]) => (
              <button key={k} className="filter-chip" aria-pressed={route === k} onClick={() => set("route", k)}>{m.label}</button>
            ))}
          </div>
          <button
            type="button"
            className="chip chip-neutral"
            onClick={() => setShowScanner(true)}
            style={{ cursor: "pointer", border: "1.5px solid var(--ink)", padding: "5px 12px", background: "var(--surface)" }}
          >
            📷 Scan lot QR sticker
          </button>
        </div>
        <div className="filters">
          <input className="input" placeholder="Search: brand, design code, colour…" value={q}
            onChange={(e) => { setQ(e.target.value); set("q", e.target.value); }} aria-label="Search listings" />
          <select className="select" value={category} onChange={(e) => set("category", e.target.value)} aria-label="Category">
            <option value="">All categories</option>
            {cats.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <button className="filter-chip" aria-pressed={near} onClick={() => set("near", near ? "" : "1")} disabled={!persona}
            title={persona ? `Within 25 km of ${persona.name}` : ""}>Near me</button>
        </div>
      </div>

      <ErrorBox error={error} />
      {items === null ? (
        <div className="grid grid-auto">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 330 }} />)}</div>
      ) : items.length === 0 ? (
        !error && <Empty title="Nothing matches yet.">Try another filter, or be the first to list something.</Empty>
      ) : (
        <div className="grid grid-auto">{items.map((li) => <ListingCard key={li.id} listing={li} />)}</div>
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} />
    </div>
  );
}
