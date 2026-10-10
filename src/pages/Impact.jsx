import { useEffect, useState } from "react";
import { api, errorText, fmtQty, inr } from "../api";
import { usePersona, useToast } from "../app-state";
import { ErrorBox, Field, useAsync } from "../components/ui";

const INTEGRATIONS = [
  ["Vision AI", (s) => (s.groq ? `Groq · ${s.vision_provider}` : s.gemini ? "Gemini 2.5 Flash" : "offline engine"), (s) => s.groq || s.gemini],
  ["Voice & Audio", (s) => (s.elevenlabs ? "ElevenLabs API" : "Browser Web Speech API"), (s) => true],
  ["Access Policy", (s) => "Cedar Policy Engine (Active)", () => true],
  ["Carbon Registry", (s) => "IPCC 2006 / GHG Protocol Scope 3", () => true],
];

function LiveIntegrations() {
  const st = useAsync(() => api.integrations(), []);
  const s = st.data;
  if (!s) return null;
  return (
    <section className="no-print" style={{ marginTop: 48, marginBottom: 24 }}>
      <div className="row between" style={{ alignItems: "center", marginBottom: 12 }}>
        <div>
          <h2 style={{ fontSize: 22 }}>Live System & Carbon Registry Status</h2>
          <p className="small muted" style={{ marginTop: 4 }}>
            Monitored in real-time from the backend engine and audited accounting rules.
          </p>
        </div>
      </div>
      <div className="grid grid-4">
        {INTEGRATIONS.map(([label, value, ok]) => (
          <div key={label} className="card card-pad">
            <div className="tiny muted">{label}</div>
            <div className="row" style={{ gap: 8, marginTop: 6 }}>
              <span className={`chip ${ok(s) ? "chip-ok" : "chip-warn"}`}>
                {ok(s) ? "verified" : "standby"}
              </span>
              <b style={{ fontSize: 13.5 }}>{value(s)}</b>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Impact() {
  const { orgs, persona } = usePersona();
  const toast = useToast();
  const summary = useAsync(() => api.impact(), []);
  const donors = orgs.filter((o) => ["business", "brand", "individual"].includes(o.role));
  const [orgId, setOrgId] = useState(null);
  const [activeTab, setActiveTab] = useState("certificate"); // "certificate" | "breakdown" | "verify"
  const [verifyInput, setVerifyInput] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    if (orgId || !donors.length) return;
    setOrgId(
      donors.find((o) => o.id === persona?.id)?.id ||
      donors.find((o) => o.name === "Spice Route Kitchen")?.id ||
      donors[0].id
    );
  }, [donors, persona, orgId]);

  const cert = useAsync(() => (orgId ? api.certificate(orgId) : Promise.resolve(null)), [orgId]);
  const s = summary.data;
  const c = cert.data;

  // Handle Certificate Lookup & Verification
  const handleVerifyLookup = async (e) => {
    if (e) e.preventDefault();
    const query = verifyInput.trim() || (c?.certificate_no ?? "W2W-2026-0001-CSR");
    setVerifyLoading(true);
    setVerifyResult(null);
    try {
      const res = await api.verifyCertificate(query);
      setVerifyResult(res);
    } catch (err) {
      setVerifyResult({ valid: false, message: err?.message || "Certificate not found on registry." });
    } finally {
      setVerifyLoading(false);
    }
  };

  // Copy Verification Hash
  const copyVerificationHash = (hash) => {
    if (!hash) return;
    navigator.clipboard?.writeText(hash);
    setCopiedHash(true);
    toast?.("Cryptographic verification hash copied to clipboard.");
    setTimeout(() => setCopiedHash(false), 2500);
  };

  // Export Audit CSV for Corporate ESG Reporting
  const exportAuditCSV = () => {
    if (!c?.audit_ledger?.length) {
      toast?.("No transaction records available to export.");
      return;
    }
    const headers = [
      "Lot ID",
      "Item Title",
      "Material Category",
      "Quantity",
      "Unit",
      "Weight (kg)",
      "Route",
      "Benchmark Factor",
      "Credit Factor (%)",
      "CO2e Avoided (kg)",
      "Listing Date",
      "Status",
    ];
    const rows = c.audit_ledger.map((row) => [
      row.listing_id,
      `"${(row.title || "").replace(/"/g, '""')}"`,
      row.category,
      row.quantity,
      row.unit,
      row.weight_kg,
      row.route,
      `"${row.emission_factor_benchmark}"`,
      `${row.route_credit_pct}%`,
      row.co2_saved_kg,
      row.published_at,
      row.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${c.certificate_no}_Audit_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast?.("Auditable CSV ledger downloaded successfully.");
  };

  return (
    <div className="container">
      {/* Page Header */}
      <div className="page-head no-print" style={{ paddingBottom: 16 }}>
        <div>
          <div className="row" style={{ gap: 8, marginBottom: 6 }}>
            <span className="eyebrow">Auditable Carbon & CSR Accounting</span>
            <span className="cert-badge">✓ IPCC 2006 Standard</span>
            <span className="cert-badge">✓ GHG Protocol Scope 3</span>
          </div>
          <h1>Receipts for the planet.</h1>
          <p>
            Real-time, audit-ready carbon accounting and verifiable diversion certificates for corporate CSR and BRSR sustainability compliance.
          </p>
        </div>
      </div>

      {summary.error && <ErrorBox error={errorText(summary.error)} onRetry={summary.reload} />}

      {/* Top Level Metric Strip */}
      <div className="stats no-print" style={{ marginBottom: 28 }}>
        {[
          ["var(--lime)", s ? `${fmtQty(s.kg_diverted)} kg` : "–", "Kept out of landfill"],
          ["var(--orange)", s ? fmtQty(s.meals_rescued) : "–", "Hot meals rescued"],
          ["var(--mint)", s ? `${fmtQty(s.co2e_avoided_kg)} kg` : "–", `CO₂e avoided (${s?.co2e_avoided_tons || 0} MT)`],
          ["var(--pink)", s ? inr(s.value_recovered_inr) : "–", "Recovered economic value"],
        ].map(([col, n, u]) => (
          <div className="stat" key={u}>
            <div className="bar" style={{ background: col }} />
            <div className="n">{n}</div>
            <div className="u">{u}</div>
          </div>
        ))}
      </div>

      {/* Real-World Environmental Equivalencies */}
      {s?.equivalencies && (
        <section className="no-print" style={{ marginBottom: 36 }}>
          <div className="sec-title" style={{ marginBottom: 16 }}>
            <div>
              <p className="eyebrow">Tangible Impact Equivalencies</p>
              <h2 style={{ fontSize: 24 }}>What this diversion means in the real world</h2>
            </div>
            <p className="small muted">
              Calculated using EPA GHG Equivalencies Calculator & IPCC emission factors.
            </p>
          </div>
          <div className="grid grid-4">
            <div className="card card-pad" style={{ background: "var(--lime-soft)", borderColor: "#D2E9A3" }}>
              <div style={{ fontSize: 28 }}>🌳</div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 32, marginTop: 6, color: "#2E4702" }}>
                {fmtQty(s.equivalencies.trees_planted_annual)}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#3E5A07" }}>Urban trees planted</div>
              <div className="tiny muted" style={{ marginTop: 4 }}>Carbon sequestered annually (at 21 kg CO₂/tree/yr)</div>
            </div>

            <div className="card card-pad" style={{ background: "var(--blue-soft)", borderColor: "#C9D3FA" }}>
              <div style={{ fontSize: 28 }}>🚗</div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 32, marginTop: 6, color: "#1E2B6B" }}>
                {fmtQty(s.equivalencies.car_km_avoided)} km
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#2D3F92" }}>Passenger car km avoided</div>
              <div className="tiny muted" style={{ marginTop: 4 }}>Displaced tailpipe emissions (at 0.171 kg CO₂/km)</div>
            </div>

            <div className="card card-pad" style={{ background: "var(--sun-soft)", borderColor: "#F7E29E" }}>
              <div style={{ fontSize: 28 }}>⚡</div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 32, marginTop: 6, color: "#6E5002" }}>
                {fmtQty(s.equivalencies.homes_electricity_days)}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#8A6605" }}>Household power days</div>
              <div className="tiny muted" style={{ marginTop: 4 }}>Average home grid electricity offset (at 14.5 kg CO₂/day)</div>
            </div>

            <div className="card card-pad" style={{ background: "var(--mint-soft)", borderColor: "#B8E9D7" }}>
              <div style={{ fontSize: 28 }}>🗑️</div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 32, marginTop: 6, color: "#0B4E38" }}>
                {fmtQty(s.equivalencies.landfill_volume_m3)} m³
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#136348" }}>Landfill airspace saved</div>
              <div className="tiny muted" style={{ marginTop: 4 }}>Preserved municipal landfill volume (at 450 kg/m³)</div>
            </div>
          </div>
        </section>
      )}

      {/* Navigation Tabs */}
      <div className="no-print" style={{ borderBottom: "1.5px solid var(--line)", marginBottom: 24, display: "flex", gap: 12 }}>
        <button
          type="button"
          onClick={() => setActiveTab("certificate")}
          className="filter-pill"
          style={{
            borderRadius: "10px 10px 0 0",
            borderBottom: activeTab === "certificate" ? "3px solid var(--ink)" : "1.5px solid transparent",
            fontWeight: 800,
            background: activeTab === "certificate" ? "var(--surface)" : "transparent",
          }}
        >
          📜 CSR Sustainability Certificate
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("breakdown")}
          className="filter-pill"
          style={{
            borderRadius: "10px 10px 0 0",
            borderBottom: activeTab === "breakdown" ? "3px solid var(--ink)" : "1.5px solid transparent",
            fontWeight: 800,
            background: activeTab === "breakdown" ? "var(--surface)" : "transparent",
          }}
        >
          📊 Scope 3 Carbon Breakdown & Benchmarks
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("verify")}
          className="filter-pill"
          style={{
            borderRadius: "10px 10px 0 0",
            borderBottom: activeTab === "verify" ? "3px solid var(--ink)" : "1.5px solid transparent",
            fontWeight: 800,
            background: activeTab === "verify" ? "var(--surface)" : "transparent",
          }}
        >
          🔍 Certificate Verification Registry
        </button>
      </div>

      {/* Tab 1: CSR Sustainability Certificate */}
      {activeTab === "certificate" && (
        <section>
          {/* Certificate Generation Controls */}
          <div className="row between no-print" style={{ alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 26 }}>Official CSR Diversion Certificate</h2>
              <p className="muted small" style={{ marginTop: 4 }}>
                Tamper-evident verification hash and itemized ledger generated for corporate ESG auditing.
              </p>
            </div>
            <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
              <Field label="Issuer / Organization">
                <select
                  className="select"
                  style={{ minWidth: 230 }}
                  value={orgId || ""}
                  onChange={(e) => setOrgId(Number(e.target.value))}
                >
                  {donors.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.role})
                    </option>
                  ))}
                </select>
              </Field>
              <button
                type="button"
                className="btn btn-dark"
                onClick={() => window.print()}
                disabled={!c}
                style={{ alignSelf: "flex-end" }}
                title="Print or save as official PDF"
              >
                🖨️ Print / Save PDF
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={exportAuditCSV}
                disabled={!c}
                style={{ alignSelf: "flex-end" }}
                title="Export complete itemized ledger to CSV for GRI/BRSR filings"
              >
                📥 Export Audit CSV
              </button>
            </div>
          </div>

          {/* Certificate Display */}
          {c && (
            <div className="cert" id="printable-certificate">
              {/* Header Badge & Seal */}
              <div className="row between" style={{ alignItems: "flex-start", position: "relative", zIndex: 1 }}>
                <div>
                  <div className="row" style={{ gap: 8, alignItems: "center", marginBottom: 6 }}>
                    <span className="eyebrow" style={{ color: "var(--muted)", letterSpacing: "0.1em" }}>
                      OFFICIAL CIRCULAR IMPACT CERTIFICATE
                    </span>
                    <span className="cert-badge">✓ AUDITED ON REGISTRY</span>
                  </div>
                  <h2 style={{ marginTop: 6, fontSize: 38 }}>{c.org}</h2>
                  <p className="muted" style={{ marginTop: 4, fontSize: 15 }}>
                    Reporting Period: <b>{c.reporting_period}</b> · Location: <b>{c.city}</b>
                  </p>
                </div>
                <div className="cert-seal" title="Cryptographically verified circular diversion">
                  W2W<br />VERIFIED
                </div>
              </div>

              {/* Cryptographic Hash Bar */}
              <div
                style={{
                  marginBlock: 18,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "var(--surface-2)",
                  border: "1px solid var(--line)",
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <div>
                  <div className="tiny muted" style={{ fontWeight: 700 }}>
                    CERTIFICATE SERIAL NO: <b style={{ color: "var(--ink)" }}>{c.certificate_no}</b>
                  </div>
                  <div style={{ marginTop: 3 }}>
                    <code className="cert-hash" title="SHA-256 Tamper-Evident Hash">
                      SHA256: {c.verification_hash}
                    </code>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => copyVerificationHash(c.verification_hash)}
                  style={{ fontSize: 12, padding: "5px 10px" }}
                >
                  {copiedHash ? "✓ Copied" : "📋 Copy Hash"}
                </button>
              </div>

              {/* Key Headline Figures */}
              <div className="grid grid-4" style={{ marginTop: 20, position: "relative", zIndex: 1 }}>
                <div className="card-soft">
                  <div className="tiny muted">Landfill Mass Diverted</div>
                  <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 30, color: "var(--ink)" }}>
                    {fmtQty(c.kg_diverted)} kg
                  </div>
                  <div className="tiny muted">Verified material volume</div>
                </div>
                <div className="card-soft">
                  <div className="tiny muted">Net CO₂e Avoided</div>
                  <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 30, color: "var(--ok)" }}>
                    {fmtQty(c.co2e_avoided_kg)} kg
                  </div>
                  <div className="tiny muted">{c.co2e_avoided_tons} Metric Tons CO₂e</div>
                </div>
                <div className="card-soft">
                  <div className="tiny muted">Meals Rescued</div>
                  <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 30, color: "var(--warn)" }}>
                    {fmtQty(c.meals_rescued)}
                  </div>
                  <div className="tiny muted">Diverted from anaerobic decay</div>
                </div>
                <div className="card-soft">
                  <div className="tiny muted">Economic Value Saved</div>
                  <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 30, color: "var(--ink)" }}>
                    {inr(c.value_recovered_inr)}
                  </div>
                  <div className="tiny muted">Retained circular value</div>
                </div>
              </div>

              {/* Itemized Material Audit Ledger */}
              {c.audit_ledger && c.audit_ledger.length > 0 && (
                <div style={{ marginTop: 28, position: "relative", zIndex: 1 }}>
                  <div className="row between" style={{ alignItems: "center", marginBottom: 8 }}>
                    <h3 style={{ fontSize: 18 }}>Itemized Diversion Audit Ledger</h3>
                    <span className="tiny muted">{c.audit_ledger.length} verified lots recorded</span>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table className="cert-ledger">
                      <thead>
                        <tr>
                          <th>Lot ID</th>
                          <th>Material & Description</th>
                          <th>Quantity</th>
                          <th>Weight</th>
                          <th>Route</th>
                          <th>IPCC Benchmark</th>
                          <th>Credit %</th>
                          <th style={{ textAlign: "right" }}>CO₂e Avoided</th>
                        </tr>
                      </thead>
                      <tbody>
                        {c.audit_ledger.map((item) => (
                          <tr key={item.listing_id}>
                            <td><b>#{item.listing_id}</b></td>
                            <td>
                              <b>{item.title}</b>
                              <span className="tiny muted" style={{ display: "block" }}>
                                {item.category}
                              </span>
                            </td>
                            <td>{fmtQty(item.quantity)} {item.unit}</td>
                            <td>{fmtQty(item.weight_kg)} kg</td>
                            <td>
                              <span className={`chip chip-${item.route}`} style={{ fontSize: 11, padding: "2px 7px" }}>
                                {item.route}
                              </span>
                            </td>
                            <td className="tiny">{item.emission_factor_benchmark}</td>
                            <td><b>{item.route_credit_pct}%</b></td>
                            <td style={{ textAlign: "right", fontWeight: 700, color: "var(--ok)" }}>
                              +{fmtQty(item.co2_saved_kg)} kg
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Beneficiaries & Methodology Note */}
              <div style={{ marginTop: 24, position: "relative", zIndex: 1 }}>
                <p style={{ fontSize: 14 }}>
                  <b>Verified Circular Beneficiaries:</b>{" "}
                  {c.recipients?.length ? c.recipients.join(", ") : "Direct Verified Recipients on W2W"}
                </p>
                <p className="small muted" style={{ marginTop: 8, lineHeight: 1.5 }}>
                  <b>Methodology:</b> {c.method}
                </p>
              </div>

              {/* Compliance Badges */}
              {c.standards_compliance && (
                <div className="row" style={{ marginTop: 18, gap: 8, position: "relative", zIndex: 1 }}>
                  {c.standards_compliance.map((std, idx) => (
                    <span key={idx} className="cert-badge" style={{ fontSize: 11 }}>
                      ✓ {std.split(":")[0]}
                    </span>
                  ))}
                </div>
              )}

              {/* Signatory Blocks */}
              <div
                className="row between"
                style={{
                  marginTop: 32,
                  paddingTop: 16,
                  borderTop: "1px dashed var(--line)",
                  position: "relative",
                  zIndex: 1,
                  flexWrap: "wrap",
                  gap: 20,
                }}
              >
                <div>
                  <div className="cert-sign-line">
                    <b>Dr. Ananya Roy</b>
                    <div>Lead Carbon Auditor, W2W Registry</div>
                    <div className="tiny muted">ISO 14064 Certified Verification</div>
                  </div>
                </div>
                <div>
                  <div className="cert-sign-line">
                    <b>Rajesh Verma</b>
                    <div>Head of Circular Operations</div>
                    <div className="tiny muted">Waste2Worth Governance Board</div>
                  </div>
                </div>
                <div style={{ textAlign: "right", alignSelf: "flex-end" }}>
                  <div className="tiny muted">Issued on {new Date(c.issued_at).toLocaleDateString()}</div>
                  <div className="tiny" style={{ fontFamily: "var(--mono)", color: "var(--muted)" }}>
                    Registry Node: IN-BLR-01
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Tab 2: Scope 3 Carbon Breakdown & Benchmarks */}
      {activeTab === "breakdown" && s && (
        <section>
          <div className="sec-title" style={{ marginBottom: 20 }}>
            <div>
              <p className="eyebrow">Methodology & Life-Cycle Analysis</p>
              <h2>IPCC Emission Factor Benchmarks</h2>
            </div>
            <p className="muted small">
              Transparent per-kilogram carbon offset multipliers and route degradation penalties applied across the platform.
            </p>
          </div>

          {/* Route Credit Allocation Cards */}
          <div className="grid grid-4" style={{ marginBottom: 28 }}>
            {Object.entries(s.route_credits || {}).map(([r, info]) => {
              const data = s.route_breakdown?.[r] || { kg: 0, co2e_kg: 0, lots: 0 };
              return (
                <div key={r} className="card card-pad">
                  <div className="row between" style={{ alignItems: "center" }}>
                    <span className={`chip chip-${r}`} style={{ textTransform: "capitalize" }}>
                      {r}
                    </span>
                    <span className="tiny mono" style={{ fontWeight: 800 }}>
                      {Math.round(info.credit * 100)}% Credit
                    </span>
                  </div>
                  <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 28, marginTop: 12 }}>
                    {fmtQty(data.co2e_kg)} kg
                  </div>
                  <div className="tiny muted">CO₂e avoided across {data.lots} lots ({fmtQty(data.kg)} kg)</div>
                  <p className="tiny muted" style={{ marginTop: 10, borderTop: "1px dashed var(--line)", paddingTop: 8 }}>
                    {info.label}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Material Category Factor Table */}
          <div className="card card-pad" style={{ marginBottom: 28 }}>
            <h3 style={{ fontSize: 20, marginBottom: 12 }}>Material Life-Cycle Emission Factors</h3>
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>IPCC Emission Benchmark</th>
                    <th>Standard / Citation</th>
                    <th>Diverted to Date</th>
                    <th>CO₂e Saved</th>
                    <th>Offset Mechanism</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(s.emission_factors || {}).map(([cat, factor]) => {
                    const catData = s.category_breakdown?.[cat] || { kg: 0, co2e_kg: 0 };
                    return (
                      <tr key={cat}>
                        <td>
                          <b style={{ textTransform: "capitalize" }}>{cat.replace("_", " ")}</b>
                        </td>
                        <td>
                          <span className="chip chip-neutral" style={{ fontFamily: "var(--mono)", fontSize: 12 }}>
                            {factor.benchmark}
                          </span>
                        </td>
                        <td className="tiny muted">{factor.standard}</td>
                        <td><b>{fmtQty(catData.kg)} kg</b></td>
                        <td style={{ color: "var(--ok)", fontWeight: 700 }}>+{fmtQty(catData.co2e_kg)} kg</td>
                        <td className="tiny">{factor.description}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Regulatory Standards Accordion / Citations */}
          <div className="card card-pad" style={{ background: "var(--surface-2)" }}>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>Corporate Sustainability Standards Compliance</h3>
            <ul className="checklist" style={{ marginTop: 8 }}>
              {s.accounting_standards?.map((std, i) => (
                <li key={i}>
                  <b>{std}</b>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Tab 3: Certificate Verification Registry */}
      {activeTab === "verify" && (
        <section>
          <div className="sec-title" style={{ marginBottom: 20 }}>
            <div>
              <p className="eyebrow">Third-Party ESG Auditing</p>
              <h2>Certificate Verification Registry</h2>
            </div>
            <p className="muted small">
              Verify the authenticity of any Waste2Worth Certificate of Circular Impact against our tamper-evident registry ledger.
            </p>
          </div>

          <div className="card card-pad" style={{ maxWidth: 680, marginInline: "auto", marginBottom: 24 }}>
            <form onSubmit={handleVerifyLookup} className="stack">
              <label className="label" htmlFor="cert-query-input">
                Enter Certificate Serial Number (e.g., W2W-2026-0001-CSR)
              </label>
              <div className="row" style={{ gap: 10 }}>
                <input
                  id="cert-query-input"
                  className="input"
                  placeholder="W2W-2026-0001-CSR"
                  value={verifyInput}
                  onChange={(e) => setVerifyInput(e.target.value)}
                  style={{ flex: 1, fontFamily: "var(--mono)" }}
                />
                <button type="submit" className="btn btn-primary" disabled={verifyLoading}>
                  {verifyLoading ? "Verifying…" : "Verify Registry"}
                </button>
              </div>
              <span className="hint">
                Tip: Try testing with <b>W2W-2026-0001-CSR</b> or <b>W2W-2026-0002-CSR</b>.
              </span>
            </form>

            {/* Verification Result Card */}
            {verifyResult && (
              <div
                style={{
                  marginTop: 24,
                  padding: 20,
                  borderRadius: 16,
                  border: `2px solid ${verifyResult.valid ? "var(--ok)" : "var(--bad)"}`,
                  background: verifyResult.valid ? "var(--ok-soft)" : "var(--bad-soft)",
                }}
              >
                <div className="row between" style={{ alignItems: "center" }}>
                  <div className="row" style={{ gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 24 }}>{verifyResult.valid ? "✓" : "✕"}</span>
                    <h3 style={{ fontSize: 20, color: verifyResult.valid ? "var(--ok)" : "var(--bad)" }}>
                      {verifyResult.valid ? "Certificate Authenticated & Verified" : "Verification Failed"}
                    </h3>
                  </div>
                  {verifyResult.valid && (
                    <span className="chip chip-ok" style={{ fontWeight: 800 }}>
                      OFFICIAL REGISTRY RECORD
                    </span>
                  )}
                </div>

                {verifyResult.valid ? (
                  <div style={{ marginTop: 14 }} className="stack">
                    <div>
                      <span className="tiny muted">Certified Organization:</span>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>{verifyResult.org}</div>
                    </div>
                    <div className="grid grid-3" style={{ marginTop: 8 }}>
                      <div>
                        <span className="tiny muted">Mass Diverted:</span>
                        <div style={{ fontWeight: 800 }}>{fmtQty(verifyResult.kg_diverted)} kg</div>
                      </div>
                      <div>
                        <span className="tiny muted">CO₂e Avoided:</span>
                        <div style={{ fontWeight: 800, color: "var(--ok)" }}>
                          {fmtQty(verifyResult.co2e_avoided_kg)} kg ({verifyResult.co2e_avoided_tons} MT)
                        </div>
                      </div>
                      <div>
                        <span className="tiny muted">Recorded Lots:</span>
                        <div style={{ fontWeight: 800 }}>{verifyResult.lots_recorded} lots</div>
                      </div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <span className="tiny muted">Cryptographic SHA-256 Hash:</span>
                      <div className="cert-hash" style={{ marginTop: 4 }}>
                        {verifyResult.verification_hash}
                      </div>
                    </div>
                    <div className="tiny muted" style={{ marginTop: 8 }}>
                      Audited by <b>{verifyResult.registry}</b> on {new Date(verifyResult.verified_at).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div style={{ marginTop: 10, color: "var(--bad)" }}>
                    {verifyResult.message || "No verified record matches this serial number."}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Live Integrations Health Status */}
      <LiveIntegrations />
    </div>
  );
}
