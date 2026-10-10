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
  const [routeCounts, setRouteCounts] = useState({ all: 0, reuse: 0, recycle: 0, resell: 0, donate: 0 });
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  const rawRouteParam = params.get("route") || "";
  const activeRoutes = rawRouteParam
    ? rawRouteParam.split(",").map((r) => r.trim().toLowerCase()).filter(Boolean)
    : [];

  const category = params.get("category") || "";
  const near = params.get("near") === "1";

  useEffect(() => {
    api.categories().then(setCats).catch(() => {});
  }, []);

  // Fetch full category inventory counts
  useEffect(() => {
    api.listings({ limit: 100 })
      .then((allListings) => {
        const counts = { all: allListings.length, reuse: 0, recycle: 0, resell: 0, donate: 0 };
        allListings.forEach((li) => {
          const r = (li.route || "").toLowerCase();
          if (counts[r] !== undefined) counts[r]++;
        });
        setRouteCounts(counts);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setQ(params.get("q") || "");
  }, [params]);

  useEffect(() => {
    const t = setTimeout(() => {
      setError(null);
      api.listings({
        route: rawRouteParam,
        category,
        q: params.get("q") || "",
        ...(near && persona ? { lat: persona.lat, lng: persona.lng, radius_km: 25 } : {}),
      })
        .then(setItems)
        .catch((e) => {
          setError(e);
          setItems([]);
        });
    }, 150);
    return () => clearTimeout(t);
  }, [params, persona, rawRouteParam, category, near]);

  const set = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };

  /**
   * Toggle category filter pill.
   * If clicking "All": clears route filters.
   * In single-mode: clicking an active route toggles it OFF (resets to All); clicking another activates it.
   * In multi-mode (or shift/ctrl/cmd held): toggles the specific route in/out of the active set.
   */
  const handleToggleRoute = (targetRoute, e) => {
    const isMulti = isMultiSelect || (e && (e.shiftKey || e.metaKey || e.ctrlKey));

    if (targetRoute === "") {
      set("route", "");
      return;
    }

    if (isMulti) {
      let next;
      if (activeRoutes.includes(targetRoute)) {
        next = activeRoutes.filter((r) => r !== targetRoute);
      } else {
        next = [...activeRoutes, targetRoute];
      }
      set("route", next.join(","));
    } else {
      if (activeRoutes.length === 1 && activeRoutes[0] === targetRoute) {
        // Toggle OFF if already active
        set("route", "");
      } else {
        // Switch to target category
        set("route", targetRoute);
      }
    }
  };

  return (
    <div className="container">
      <div className="page-head row between" style={{ alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
        <div>
          <p className="eyebrow">Explore Marketplace</p>
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
        {/* Category Pill Filters Bar */}
        <div style={{ marginBottom: 16 }}>
          <div className="row between" style={{ alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 10 }}>
            <div className="row" style={{ gap: 8, alignItems: "center" }}>
              <span className="eyebrow" style={{ fontSize: 11, letterSpacing: "0.08em" }}>
                Filter By Category:
              </span>
            </div>
            <div className="row" style={{ gap: 8, alignItems: "center" }}>
              <label
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12.5,
                  cursor: "pointer",
                  color: isMultiSelect ? "var(--ink)" : "var(--muted)",
                  fontWeight: isMultiSelect ? 700 : 500,
                  userSelect: "none",
                }}
                title="Enable to select multiple categories simultaneously"
              >
                <input
                  type="checkbox"
                  checked={isMultiSelect}
                  onChange={(e) => setIsMultiSelect(e.target.checked)}
                  style={{ accentColor: "var(--ink)", cursor: "pointer" }}
                />
                Multi-category select
              </label>
              <button
                type="button"
                className="chip chip-neutral"
                onClick={() => setShowScanner(true)}
                style={{ cursor: "pointer", border: "1.5px solid var(--ink)", padding: "4px 10px", background: "var(--surface)" }}
              >
                📷 Scan lot QR
              </button>
            </div>
          </div>

          <div className="filter-pills" role="toolbar" aria-label="Category filter pills">
            {/* All Categories Pill */}
            <button
              type="button"
              className={`filter-pill filter-pill-all ${activeRoutes.length === 0 ? "active" : ""}`}
              aria-pressed={activeRoutes.length === 0}
              onClick={(e) => handleToggleRoute("", e)}
              title="View all categories"
            >
              <span>All</span>
              {routeCounts.all > 0 && <span className="filter-pill-count">{routeCounts.all}</span>}
            </button>

            {/* Reuse, Recycle, Resell, Donate Pills */}
            {Object.entries(ROUTE_META).map(([k, m]) => {
              const isSelected = activeRoutes.includes(k);
              const count = routeCounts[k] || 0;
              return (
                <button
                  key={k}
                  type="button"
                  className={`filter-pill filter-pill-${k} ${isSelected ? "active" : ""}`}
                  aria-pressed={isSelected}
                  onClick={(e) => handleToggleRoute(k, e)}
                  title={
                    isSelected
                      ? `Click to toggle OFF ${m.label} category`
                      : `Click to filter by ${m.label} category`
                  }
                >
                  <span className="dot" />
                  <span>{m.label}</span>
                  {count > 0 && <span className="filter-pill-count">{count}</span>}
                </button>
              );
            })}
          </div>

          {/* Active Filter Helper Tagline */}
          {activeRoutes.length > 0 && (
            <div className="row" style={{ marginTop: 10, gap: 8, alignItems: "center", fontSize: 13 }}>
              <span className="muted">
                Showing:{" "}
                <b style={{ color: "var(--ink)" }}>
                  {activeRoutes.map((r) => ROUTE_META[r]?.label || r).join(" + ")}
                </b>{" "}
                ({items ? items.length : 0} {items?.length === 1 ? "lot" : "lots"} found)
              </span>
              <button
                type="button"
                className="linkish small"
                onClick={() => set("route", "")}
                style={{ color: "var(--bad)", textDecorationColor: "var(--bad)", cursor: "pointer" }}
              >
                ✕ Clear category filter
              </button>
            </div>
          )}
        </div>

        {/* Search, Material Category & Location Filters */}
        <div className="filters" style={{ borderTop: "1px dashed var(--line)", paddingTop: 14 }}>
          <input
            className="input"
            placeholder="Search: brand, design code, colour, keywords…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              set("q", e.target.value);
            }}
            aria-label="Search listings"
          />
          <select
            className="select"
            value={category}
            onChange={(e) => set("category", e.target.value)}
            aria-label="Material Category"
          >
            <option value="">All materials</option>
            {cats.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
          <button
            className="filter-chip"
            aria-pressed={near}
            onClick={() => set("near", near ? "" : "1")}
            disabled={!persona}
            title={persona ? `Within 25 km of ${persona.name}` : "Select a profile to enable distance filter"}
          >
            Near me
          </button>
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
