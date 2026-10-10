import { useEffect, useState } from "react";
import { api } from "../api";
import { useToast } from "../app-state";
import { Spinner } from "./ui";

export default function CloudServicesModal({ isOpen, onClose }) {
  const toast = useToast();
  const [tab, setTab] = useState("cedar"); // cedar | eventbridge | cloudwatch | stack
  const [cloudStatus, setCloudStatus] = useState(null);
  const [cedarData, setCedarData] = useState(null);
  const [events, setEvents] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cedar Simulator State
  const [simOrgId, setSimOrgId] = useState("12"); // Full Plate Foundation (Verified NGO)
  const [simAction, setSimAction] = useState("ClaimDonation");
  const [simResourceId, setSimResourceId] = useState("12"); // Biryani lot
  const [evalResult, setEvalResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    Promise.all([
      api.cloudStatus().catch(() => null),
      api.cedarPolicies().catch(() => null),
      api.eventBridgeEvents().catch(() => []),
      api.cloudWatchMetrics().catch(() => null),
    ]).then(([status, cedar, evts, cw]) => {
      setCloudStatus(status);
      setCedarData(cedar);
      setEvents(evts || []);
      setMetrics(cw);
      setLoading(false);
    });
  }, [isOpen]);

  const handleEvaluateCedar = async () => {
    setEvaluating(true);
    try {
      const res = await api.cedarEvaluate({
        principal_id: simOrgId,
        action: simAction,
        resource_id: simResourceId,
      });
      setEvalResult(res);
      toast(`Cedar evaluated: ${res.decision}`, res.decision === "ALLOW" ? "ok" : "warn");
    } catch (err) {
      toast("Failed to evaluate Cedar policy", "bad");
    } finally {
      setEvaluating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="qr-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="qr-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 680, maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="row between" style={{ marginBottom: 16 }}>
          <div className="row" style={{ gap: 10, alignItems: "center" }}>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "var(--lime)",
                border: "2px solid var(--ink)",
                display: "grid",
                placeItems: "center",
                boxShadow: "2px 2px 0 var(--ink)",
                fontSize: 18,
              }}
            >
              ☁️
            </span>
            <div>
              <h2 style={{ fontSize: 20, margin: 0 }}>Cloud Architecture & Services</h2>
              <p className="small muted" style={{ margin: 0 }}>
                Powered by Cedar, EventBridge, CloudWatch, S3, & OpenSearch
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm"
            onClick={onClose}
            style={{ borderRadius: "50%", width: 34, height: 34, padding: 0 }}
          >
            ✕
          </button>
        </div>

        {/* Tab Bar */}
        <div className="row" style={{ gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <button
            type="button"
            className={`qr-tab ${tab === "cedar" ? "active" : ""}`}
            onClick={() => setTab("cedar")}
          >
            🛡️ Cedar Policies
          </button>
          <button
            type="button"
            className={`qr-tab ${tab === "eventbridge" ? "active" : ""}`}
            onClick={() => setTab("eventbridge")}
          >
            ⚡ EventBridge Bus ({events.length})
          </button>
          <button
            type="button"
            className={`qr-tab ${tab === "cloudwatch" ? "active" : ""}`}
            onClick={() => setTab("cloudwatch")}
          >
            📊 CloudWatch Metrics
          </button>
          <button
            type="button"
            className={`qr-tab ${tab === "stack" ? "active" : ""}`}
            onClick={() => setTab("stack")}
          >
            🧱 Active Cloud Stack
          </button>
        </div>

        {loading ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <Spinner />
            <p className="small muted" style={{ marginTop: 8 }}>Connecting to cloud control plane…</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* TAB 1: CEDAR POLICIES */}
            {tab === "cedar" && (
              <div className="stack" style={{ gap: 14 }}>
                <div className="card card-soft" style={{ padding: 14 }}>
                  <b style={{ fontSize: 14, display: "block", marginBottom: 6 }}>
                    Cedar Policy Simulator (Real-time RBAC/ABAC Evaluation)
                  </b>
                  <p className="small muted" style={{ marginTop: 0, marginBottom: 12 }}>
                    Cedar evaluates every operation against verified organization attributes and waste lot specifications.
                  </p>

                  <div className="row" style={{ gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <label className="tiny muted" style={{ display: "block", fontWeight: 700, marginBottom: 4 }}>
                        Principal (Org)
                      </label>
                      <select
                        className="select"
                        style={{ fontSize: 13, padding: "6px 10px", width: "100%" }}
                        value={simOrgId}
                        onChange={(e) => setSimOrgId(e.target.value)}
                      >
                        <option value="12">Full Plate Foundation (Verified NGO)</option>
                        <option value="14">Hope Kitchen (Unverified NGO)</option>
                        <option value="1">BuildRight Contractors (Seller #1)</option>
                        <option value="7">Ravi Renovations (Buyer)</option>
                      </select>
                    </div>

                    <div style={{ flex: 1, minWidth: 140 }}>
                      <label className="tiny muted" style={{ display: "block", fontWeight: 700, marginBottom: 4 }}>
                        Action
                      </label>
                      <select
                        className="select"
                        style={{ fontSize: 13, padding: "6px 10px", width: "100%" }}
                        value={simAction}
                        onChange={(e) => setSimAction(e.target.value)}
                      >
                        <option value="ClaimDonation">Action::"ClaimDonation"</option>
                        <option value="WithdrawListing">Action::"WithdrawListing"</option>
                        <option value="BookRecycle">Action::"BookRecycle"</option>
                        <option value="ReservePool">Action::"ReservePool"</option>
                      </select>
                    </div>

                    <div style={{ flex: 1, minWidth: 140 }}>
                      <label className="tiny muted" style={{ display: "block", fontWeight: 700, marginBottom: 4 }}>
                        Resource
                      </label>
                      <select
                        className="select"
                        style={{ fontSize: 13, padding: "6px 10px", width: "100%" }}
                        value={simResourceId}
                        onChange={(e) => setSimResourceId(e.target.value)}
                      >
                        <option value="12">#12: 40 plates veg biryani (donate)</option>
                        <option value="1">#1: Terrano Tiles (resell)</option>
                        <option value="9">#9: TMT rebar offcuts (recycle)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={handleEvaluateCedar}
                      disabled={evaluating}
                      style={{ height: 38 }}
                    >
                      {evaluating ? <Spinner /> : "Evaluate Policy →"}
                    </button>
                  </div>

                  {evalResult && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: "var(--r)",
                        border: "2px solid var(--ink)",
                        background: evalResult.decision === "ALLOW" ? "var(--lime-soft)" : "var(--bad-soft)",
                      }}
                    >
                      <div className="row between" style={{ alignItems: "center" }}>
                        <span
                          className={`chip ${evalResult.decision === "ALLOW" ? "chip-ok" : "chip-bad"}`}
                          style={{ fontSize: 13 }}
                        >
                          {evalResult.decision === "ALLOW" ? "✓ CEDAR PERMIT (ALLOW)" : "✕ CEDAR FORBID (DENY)"}
                        </span>
                        <span className="tiny mono muted">Matched: {evalResult.policyId} ({evalResult.durationMs}ms)</span>
                      </div>
                      <p style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 600 }}>{evalResult.reason}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 style={{ margin: "0 0 10px 0", fontSize: 15 }}>Active Cedar Policies</h4>
                  <div className="stack" style={{ gap: 8 }}>
                    {(cedarData?.policies || []).map((pol) => (
                      <div key={pol.id} className="card" style={{ padding: 12 }}>
                        <div className="row between" style={{ marginBottom: 4 }}>
                          <b>{pol.name}</b>
                          <span className="chip chip-neutral mono" style={{ fontSize: 11 }}>{pol.id}</span>
                        </div>
                        <p className="small muted" style={{ margin: "0 0 8px 0" }}>{pol.description}</p>
                        <pre
                          className="mono"
                          style={{
                            background: "var(--surface-2)",
                            padding: 10,
                            borderRadius: 8,
                            fontSize: 12,
                            overflowX: "auto",
                            margin: 0,
                            border: "1px solid var(--line)",
                          }}
                        >
                          {pol.cedar}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: EVENTBRIDGE */}
            {tab === "eventbridge" && (
              <div className="stack" style={{ gap: 12 }}>
                <div className="row between" style={{ alignItems: "center" }}>
                  <span className="small muted">
                    Bus: <b>waste2worth-production-bus</b> · Real-time event routing
                  </span>
                  <span className="chip chip-ok">● EventBridge Connected</span>
                </div>

                <div className="stack" style={{ gap: 8 }}>
                  {events.length === 0 ? (
                    <p className="small muted">No events published yet.</p>
                  ) : (
                    events.map((evt) => (
                      <div key={evt.id} className="card card-soft" style={{ padding: 12 }}>
                        <div className="row between" style={{ marginBottom: 6 }}>
                          <span className="chip chip-neutral" style={{ fontWeight: 800 }}>
                            ⚡ {evt.detailType}
                          </span>
                          <span className="tiny mono muted">{new Date(evt.time).toLocaleTimeString()}</span>
                        </div>
                        <div className="tiny mono muted" style={{ marginBottom: 4 }}>
                          Source: {evt.source} · ID: {evt.id}
                        </div>
                        <pre
                          className="mono"
                          style={{
                            background: "var(--surface)",
                            padding: 8,
                            borderRadius: 6,
                            fontSize: 11.5,
                            overflowX: "auto",
                            margin: 0,
                            border: "1px solid var(--line)",
                          }}
                        >
                          {JSON.stringify(evt.detail, null, 2)}
                        </pre>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: CLOUDWATCH */}
            {tab === "cloudwatch" && (
              <div className="stack" style={{ gap: 14 }}>
                <div className="row between" style={{ alignItems: "center" }}>
                  <span className="small muted">
                    Namespace: <b>Waste2Worth/CloudWatch</b>
                  </span>
                  <span className="chip chip-ok">● Metrics Stream Active</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  {Object.entries(metrics?.metrics || {}).map(([key, val]) => (
                    <div key={key} className="card card-soft" style={{ padding: 12 }}>
                      <div className="tiny muted">{key.replace(/([A-Z])/g, " $1").trim()}</div>
                      <b style={{ fontSize: 20, color: "var(--ink)" }}>{String(val)}</b>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: COMPLETE STACK */}
            {tab === "stack" && (
              <div className="stack" style={{ gap: 10 }}>
                {[
                  { name: "Auth & Policy", tech: "Cedar", desc: "Fine-grained permit/forbid policy engine for NGO donations & RBAC/ABAC authorization.", status: "Active" },
                  { name: "The Plumbing", tech: "EventBridge & SQS", desc: "Event bus routing lot publishing and claim workflows to SQS FIFO dispatch queues.", status: "Active" },
                  { name: "Observability", tech: "CloudWatch", desc: "Real-time metrics for CO₂e avoidance, Cedar latencies, and transaction events.", status: "Active" },
                  { name: "Storage & CDN", tech: "S3 & CloudFront", desc: "Secure photo provenance storage and global edge delivery for lot images.", status: "Active" },
                  { name: "Search & Discovery", tech: "OpenSearch", desc: "Multi-attribute text, material token, and geospatial search cluster.", status: "Active" },
                  { name: "Agents & AI", tech: "SageMaker AI", desc: "Computer vision defect inspection endpoint for damage assessment.", status: "Active" },
                ].map((s) => (
                  <div key={s.tech} className="card card-soft row between" style={{ padding: 12, alignItems: "center" }}>
                    <div>
                      <div className="row" style={{ gap: 8, alignItems: "center", marginBottom: 3 }}>
                        <b style={{ fontSize: 14 }}>{s.tech}</b>
                        <span className="chip chip-neutral" style={{ fontSize: 11 }}>{s.name}</span>
                      </div>
                      <p className="small muted" style={{ margin: 0 }}>{s.desc}</p>
                    </div>
                    <span className="chip chip-ok" style={{ marginLeft: 12 }}>✓ {s.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="row between" style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--line)" }}>
          <span className="tiny muted">AWS Architecture Integration · Live Service Mesh</span>
          <button type="button" className="btn btn-sm btn-dark" onClick={onClose}>
            Close Console
          </button>
        </div>
      </div>
    </div>
  );
}
