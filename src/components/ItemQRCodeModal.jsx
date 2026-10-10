import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { inr, pretty } from "../api";

export default function ItemQRCodeModal({ listing, isOpen, onClose }) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    if (!listing || !isOpen) return;
    const itemUrl = `${window.location.origin}/listing/${listing.id}`;
    QRCode.toDataURL(itemUrl, {
      width: 260,
      margin: 1.5,
      color: { dark: "#17171C", light: "#FFFFFF" },
    })
      .then(setDataUrl)
      .catch((err) => console.error("QR generation failed", err));
  }, [listing, isOpen]);

  if (!isOpen || !listing) return null;

  const lotCode = `W2W-LOT-${String(listing.id).padStart(4, "0")}`;

  return (
    <div className="qr-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440, textAlign: "center" }}>
        <div className="row between" style={{ marginBottom: 12 }}>
          <span className="chip chip-neutral" style={{ fontSize: 12 }}>
            Official Lot Tag
          </span>
          <button
            type="button"
            className="btn btn-sm"
            onClick={onClose}
            style={{ borderRadius: "50%", width: 32, height: 32, padding: 0 }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            background: "#fff",
            border: "2px solid var(--ink)",
            borderRadius: "var(--r)",
            padding: "20px",
            boxShadow: "3px 3px 0 var(--ink)",
            marginBottom: 16,
          }}
        >
          <div className="row between" style={{ marginBottom: 10, alignItems: "center" }}>
            <span style={{ fontWeight: 800, fontSize: 16, color: "var(--ink)" }}>
              waste<span style={{ color: "#5F7F14" }}>2</span>worth
            </span>
            <span className="mono small" style={{ fontWeight: 700, color: "var(--muted)" }}>
              {lotCode}
            </span>
          </div>

          {dataUrl ? (
            <img
              src={dataUrl}
              alt={`QR code for lot ${listing.id}`}
              style={{ width: 220, height: 220, margin: "0 auto", display: "block" }}
            />
          ) : (
            <div style={{ width: 220, height: 220, margin: "0 auto", background: "var(--surface-2)" }} />
          )}

          <div style={{ marginTop: 12, borderTop: "1px dashed var(--line-strong)", paddingTop: 10, textAlign: "left" }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{listing.title}</div>
            <div className="small muted" style={{ marginTop: 2 }}>
              {listing.quantity} {listing.unit} · {pretty(listing.condition)} condition
            </div>
            {listing.asking_price_per_unit ? (
              <div style={{ fontWeight: 700, marginTop: 4, color: "var(--ink)" }}>
                {inr(listing.asking_price_per_unit)} / {listing.unit}
              </div>
            ) : null}
          </div>
        </div>

        <div className="row" style={{ gap: 8, justifyContent: "center" }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => window.print()}
          >
            🖨️ Print Lot Tag
          </button>
          <button type="button" className="btn btn-sm" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
