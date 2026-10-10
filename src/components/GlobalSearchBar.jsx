import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, fmtQty, imgUrl, inr, pretty } from "../api";
import { RouteChip } from "./ui";
import { getImageForListing } from "../listing-images";

const COMMON_MATERIALS = [
  { name: "Vitrified", key: "vitrified" },
  { name: "Ceramic", key: "ceramic" },
  { name: "Teak Wood", key: "teak" },
  { name: "Hardwood", key: "hardwood" },
  { name: "Mild Steel", key: "mild steel" },
  { name: "Copper", key: "copper" },
  { name: "Aluminium", key: "aluminium" },
  { name: "Cotton Fleece", key: "cotton fleece" },
  { name: "Denim", key: "denim" },
  { name: "Corrugated Cardboard", key: "cardboard" },
];

export default function GlobalSearchBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const wrapRef = useRef(null);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [listings, setListings] = useState([]);

  // Load categories and listings for instant real-time client search
  useEffect(() => {
    let active = true;
    api.categories().then((cats) => {
      if (active) setCategories(cats || []);
    }).catch(() => {});

    api.listings({ limit: 100 }).then((items) => {
      if (active) setListings(items || []);
    }).catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  // Sync if on Explore page
  const isExplorePage = location.pathname === "/explore";
  useEffect(() => {
    if (isExplorePage) {
      const urlQuery = new URLSearchParams(location.search).get("q") || "";
      if (urlQuery !== query) {
        setQuery(urlQuery);
      }
    }
  }, [location.search, isExplorePage]);

  // Handle outside click to close flyout
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter listings, categories, and materials in real-time
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { matchedCategories: [], matchedMaterials: [], matchedListings: [], total: 0 };
    }

    // 1. Matched Categories
    const matchedCategories = categories.filter(
      (c) => c.label.toLowerCase().includes(q) || c.key.toLowerCase().includes(q)
    );

    // 2. Matched Material Types
    const matchedMaterials = COMMON_MATERIALS.filter((m) =>
      m.name.toLowerCase().includes(q) || m.key.toLowerCase().includes(q)
    );

    // 3. Matched Listings
    const matchedListings = listings.filter((li) => {
      const titleMatch = (li.title || "").toLowerCase().includes(q);
      const catMatch = (li.category || "").toLowerCase().includes(q);
      const brandMatch = (li.brand || "").toLowerCase().includes(q);
      const colorMatch = (li.manufacturer_color || "").toLowerCase().includes(q);
      const descMatch = (li.description || "").toLowerCase().includes(q);
      const matMatch = String(li.attributes?.material || li.attributes?.fabric || "").toLowerCase().includes(q);
      return titleMatch || catMatch || brandMatch || colorMatch || descMatch || matMatch;
    });

    return {
      matchedCategories,
      matchedMaterials,
      matchedListings,
      total: matchedListings.length,
    };
  }, [query, categories, listings]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);

    // If currently on Explore view, filter real-time immediately in URL
    if (isExplorePage) {
      const params = new URLSearchParams(location.search);
      if (val.trim()) {
        params.set("q", val);
      } else {
        params.delete("q");
      }
      navigate(`/explore?${params.toString()}`, { replace: true });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsOpen(false);
    if (query.trim()) {
      navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/explore");
    }
  };

  const handleClear = () => {
    setQuery("");
    setIsOpen(false);
    if (isExplorePage) {
      const params = new URLSearchParams(location.search);
      params.delete("q");
      navigate(`/explore?${params.toString()}`, { replace: true });
    }
  };

  const handleSelectCategory = (catKey) => {
    setIsOpen(false);
    navigate(`/explore?category=${encodeURIComponent(catKey)}`);
  };

  const handleSelectMaterial = (materialKey) => {
    setQuery(materialKey);
    setIsOpen(false);
    navigate(`/explore?q=${encodeURIComponent(materialKey)}`);
  };

  const handleSelectListing = (id) => {
    setIsOpen(false);
    navigate(`/listing/${id}`);
  };

  const hasMatches =
    searchResults.matchedCategories.length > 0 ||
    searchResults.matchedMaterials.length > 0 ||
    searchResults.matchedListings.length > 0;

  return (
    <div className="global-search-wrap" ref={wrapRef}>
      <form onSubmit={handleSubmit} className="global-search-input-box">
        <span className="global-search-icon" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="search"
          className="global-search-input"
          placeholder="Search items, materials, categories…"
          value={query}
          onChange={handleChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
          }}
          aria-label="Global search listings by keyword, category, or material"
          aria-expanded={isOpen && Boolean(query.trim())}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="global-search-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </form>

      {/* Real-time Search Flyout Dropdown */}
      {isOpen && query.trim() && (
        <div className="global-search-flyout" role="listbox">
          {/* Matched Categories */}
          {searchResults.matchedCategories.length > 0 && (
            <div>
              <div className="global-search-section-title">Categories</div>
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {searchResults.matchedCategories.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    className="global-search-pill-btn"
                    onClick={() => handleSelectCategory(c.key)}
                  >
                    🏷️ {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Material Types */}
          {searchResults.matchedMaterials.length > 0 && (
            <div>
              <div className="global-search-section-title">Materials</div>
              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {searchResults.matchedMaterials.map((m) => (
                  <button
                    key={m.key}
                    type="button"
                    className="global-search-pill-btn"
                    onClick={() => handleSelectMaterial(m.name)}
                  >
                    🧱 {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Listings */}
          {searchResults.matchedListings.length > 0 && (
            <div>
              <div className="global-search-section-title">
                Matching Listings ({searchResults.total})
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {searchResults.matchedListings.slice(0, 5).map((li) => {
                  const img = li.images?.[0];
                  const imgSrc = (img?.url && img.url.startsWith("data:image/jpeg;base64"))
                    ? imgUrl(img.url)
                    : getImageForListing(li.title, li.category);
                  return (
                    <div
                      key={li.id}
                      className="global-search-item"
                      onClick={() => handleSelectListing(li.id)}
                      role="option"
                      aria-selected="false"
                    >
                      <div className="global-search-item-thumb">
                        <img src={imgSrc} alt="" referrerPolicy="no-referrer" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="global-search-item-title">{li.title}</div>
                        <div className="global-search-item-meta">
                          <RouteChip route={li.route} />
                          <span>· {pretty(li.category)}</span>
                          <span>· {fmtQty(li.available)} {li.unit}</span>
                          <span style={{ fontWeight: 700, color: "var(--ink)", marginLeft: "auto" }}>
                            {li.route === "donate" ? "Free" : li.asking_price_per_unit ? inr(li.asking_price_per_unit) : "–"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Action / View All */}
          {hasMatches ? (
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 10 }}>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={handleSubmit}
              >
                View all results for "{query.trim()}" in Explore →
              </button>
            </div>
          ) : (
            <div style={{ padding: "16px 8px", textAlign: "center", color: "var(--muted)" }}>
              <p style={{ margin: 0, fontWeight: 700, color: "var(--ink)" }}>No listings found</p>
              <span className="small">Try searching by brand (e.g. Terrano), material (e.g. Teak), or category</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
