import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsQR from "jsqr";
import QRCode from "qrcode";
import { useToast } from "../app-state";
import { Spinner } from "./ui";
import { recordScan } from "../scan-history";

function triggerHapticFeedback() {
  // 1. Hardware vibration for mobile/PWA environments
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    try {
      navigator.vibrate([40, 50, 75]);
    } catch (_) {}
  }

  // 2. Synthesized physical haptic actuator click (linear resonant actuator pulse + confirmation chime)
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Low-frequency rumble pulse (simulates physical motor thump)
    const rumbleOsc = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumbleOsc.type = "triangle";
    rumbleOsc.frequency.setValueAtTime(140, ctx.currentTime);
    rumbleOsc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.12);
    rumbleGain.gain.setValueAtTime(0.35, ctx.currentTime);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);
    rumbleOsc.start();
    rumbleOsc.stop(ctx.currentTime + 0.13);

    // High confirmation click & chime
    const chimeOsc = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chimeOsc.type = "sine";
    chimeOsc.frequency.setValueAtTime(980, ctx.currentTime + 0.04);
    chimeOsc.frequency.exponentialRampToValueAtTime(1480, ctx.currentTime + 0.18);
    chimeGain.gain.setValueAtTime(0.001, ctx.currentTime);
    chimeGain.gain.setValueAtTime(0.22, ctx.currentTime + 0.04);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    chimeOsc.connect(chimeGain);
    chimeGain.connect(ctx.destination);
    chimeOsc.start(ctx.currentTime + 0.04);
    chimeOsc.stop(ctx.currentTime + 0.36);
  } catch (_) {
    // AudioContext might be restricted prior to user interaction
  }
}

export function extractListingId(raw) {
  if (!raw || typeof raw !== "string") return null;
  const str = raw.trim();

  // 1. URL pattern: /listing/123 or https://domain.com/listing/123
  const urlMatch = str.match(/\/listing\/(\d+)/i);
  if (urlMatch) return parseInt(urlMatch[1], 10);

  // 2. Query param: id=123 or listing_id=123
  const queryMatch = str.match(/[?&](?:listing_)?id=(\d+)/i);
  if (queryMatch) return parseInt(queryMatch[1], 10);

  // 3. JSON format: {"id": 123} or {"listing_id": 123}
  try {
    const parsed = JSON.parse(str);
    const parsedId = parsed?.id || parsed?.listing_id;
    if (parsedId && !isNaN(Number(parsedId))) {
      return parseInt(parsedId, 10);
    }
  } catch (_) {}

  // 4. Prefixed format: w2w-123, listing:123, item#123
  const prefixMatch = str.match(/^(?:w2w|listing|item|lot)[-:#\s]*(\d+)$/i);
  if (prefixMatch) return parseInt(prefixMatch[1], 10);

  // 5. Plain number: 123
  if (/^\d+$/.test(str)) {
    return parseInt(str, 10);
  }

  return null;
}

const DEMO_SAMPLES = [
  { id: 1, title: "Terrano Vitrified Floor Tiles", code: "W2W-LOT-0001", cat: "Tiles", desc: "40 tiles · 600x600 matte white" },
  { id: 5, title: "Office Laptops (i5 8th gen)", code: "W2W-LOT-0005", cat: "Electronics", desc: "12 units · wiped & tested" },
  { id: 7, title: "Cotton Hoodies (Logo Misprint)", code: "W2W-LOT-0007", cat: "Clothing", desc: "60 pcs · brand seconds" },
  { id: 12, title: "40 Plates Veg Biryani", code: "W2W-LOT-0012", cat: "Cooked Food", desc: "Surplus lunch order · donate" },
];

export default function QRScannerModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState("camera"); // camera | upload | sample
  const [cameraStatus, setCameraStatus] = useState("idle"); // idle | active | denied | error
  const [cameraError, setCameraError] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [sampleQrs, setSampleQrs] = useState({});
  const [scannedResult, setScannedResult] = useState(null);
  const [hapticActive, setHapticActive] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);
  const isScanningRef = useRef(true);

  // Generate QR code images for demo samples
  useEffect(() => {
    let active = true;
    async function gen() {
      const urls = {};
      for (const sample of DEMO_SAMPLES) {
        try {
          const targetUrl = `${window.location.origin}/listing/${sample.id}`;
          const dataUrl = await QRCode.toDataURL(targetUrl, {
            width: 140,
            margin: 1,
            color: { dark: "#17171C", light: "#FFFFFF" },
          });
          if (active) urls[sample.id] = dataUrl;
        } catch (_) {}
      }
      if (active) setSampleQrs(urls);
    }
    gen();
    return () => {
      active = false;
    };
  }, []);

  // Handle successful scan
  const handleSuccess = (rawText) => {
    if (!isScanningRef.current) return;
    const listingId = extractListingId(rawText);

    if (listingId !== null) {
      isScanningRef.current = false;
      recordScan(listingId);

      // Trigger tactile haptic feedback simulation
      triggerHapticFeedback();
      setHapticActive(true);
      setTimeout(() => setHapticActive(false), 380);

      setScannedResult(listingId);
      setTab("camera"); // Switch to camera/scanner view to showcase the reticle checkmark

      toast(`QR Verified: Waste Item #${listingId} scanned! Redirecting…`, "info");

      // Brief success animation window (reticle checkmark bloom) before navigating
      setTimeout(() => {
        stopCamera();
        onClose();
        navigate(`/listing/${listingId}`);
      }, 950);
    } else {
      toast(`Scanned: "${rawText.slice(0, 30)}" - not a valid Waste2Worth item tag`, "bad");
    }
  };

  // Stop camera stream safely
  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStatus("idle");
  };

  // Start camera stream
  const startCamera = async () => {
    stopCamera();
    isScanningRef.current = true;
    setScannedResult(null);
    setCameraError("");
    setCameraStatus("loading");

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraStatus("error");
      setCameraError("Camera API is not supported in this browser environment. Please use image upload or quick samples.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        await videoRef.current.play();
        setCameraStatus("active");
        scanVideoFrame();
      }
    } catch (err) {
      console.warn("Camera access failed:", err);
      setCameraStatus("denied");
      setCameraError(
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera permission was denied. You can upload an image or scan a sample item instead."
          : "Unable to access video device. Try image upload or quick sample."
      );
    }
  };

  // Scan loop on video frame
  const scanVideoFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isScanningRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          handleSuccess(code.data);
          return;
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(scanVideoFrame);
  };

  // Process uploaded image file
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);

        if (code && code.data) {
          handleSuccess(code.data);
        } else {
          toast("No QR code detected in this photo. Try another image or higher resolution.", "bad");
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isOpen && tab === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, tab]);

  if (!isOpen) return null;

  return (
    <div className="qr-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="qr-modal-title">
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="row between" style={{ marginBottom: 16 }}>
          <div className="row" style={{ gap: 10 }}>
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
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </span>
            <div>
              <h2 id="qr-modal-title" style={{ fontSize: 20, margin: 0 }}>
                Scan Waste Lot QR
              </h2>
              <p className="small muted" style={{ margin: 0 }}>
                Instant provenance & verification lookup
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm"
            onClick={onClose}
            style={{ borderRadius: "50%", width: 34, height: 34, padding: 0, fontWeight: 800 }}
            aria-label="Close scanner"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="row" style={{ gap: 8, marginBottom: 16 }}>
          <button
            type="button"
            className={`qr-tab ${tab === "camera" ? "active" : ""}`}
            onClick={() => setTab("camera")}
          >
            📷 Live Camera
          </button>
          <button
            type="button"
            className={`qr-tab ${tab === "upload" ? "active" : ""}`}
            onClick={() => setTab("upload")}
          >
            📁 Upload Photo
          </button>
          <button
            type="button"
            className={`qr-tab ${tab === "sample" ? "active" : ""}`}
            onClick={() => setTab("sample")}
          >
            ⚡ Test Lots
          </button>
        </div>

        {/* Tab 1: Live Camera Scanner */}
        {tab === "camera" && (
          <div>
            <div className={`qr-scanner-frame ${hapticActive ? "haptic-shake" : ""}`}>
              {/* Hidden Canvas for Decoding */}
              <canvas ref={canvasRef} style={{ display: "none" }} />
              {/* Live Video */}
              <video
                ref={videoRef}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: cameraStatus === "active" ? "block" : "none",
                }}
              />

              {/* Reticle & Animated Scan Line */}
              {!scannedResult && (
                <>
                  <div className="qr-reticle" />
                  <div className="qr-scan-line" />
                  <span
                    style={{
                      position: "absolute",
                      bottom: 12,
                      background: "rgba(23, 23, 28, 0.75)",
                      color: "#fff",
                      padding: "4px 12px",
                      borderRadius: 999,
                      fontSize: 12.5,
                      fontWeight: 600,
                      letterSpacing: 0.2,
                    }}
                  >
                    Point camera at Waste2Worth lot tag
                  </span>
                </>
              )}

              {/* Success animation: Animated checkmark appearing in the reticle */}
              {scannedResult && (
                <div className="qr-reticle success" role="status" aria-label="QR Code Verified">
                  <svg
                    className="reticle-checkmark-svg"
                    viewBox="0 0 80 80"
                    width="84"
                    height="84"
                    fill="none"
                  >
                    <circle
                      className="reticle-circle"
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="var(--lime)"
                      strokeWidth="4.5"
                    />
                    <path
                      className="reticle-check"
                      d="M24 41 L35 52 L56 29"
                      stroke="var(--lime)"
                      strokeWidth="5.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="reticle-badge">
                    ✓ Lot #{scannedResult} Verified
                  </div>
                </div>
              )}

              {/* Loading State */}
              {cameraStatus === "loading" && (
                <div style={{ color: "#fff", textAlign: "center" }}>
                  <Spinner />
                  <p style={{ marginTop: 8, fontSize: 14 }}>Starting camera feed…</p>
                </div>
              )}

              {/* Error / Denied State */}
              {(cameraStatus === "denied" || cameraStatus === "error") && (
                <div style={{ color: "#fff", textAlign: "center", padding: "20px" }}>
                  <span style={{ fontSize: 32 }}>📷⚠️</span>
                  <p style={{ marginTop: 8, fontSize: 13.5, color: "#FFAE73" }}>{cameraError}</p>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    style={{ marginTop: 12 }}
                    onClick={() => setTab("sample")}
                  >
                    Use Sample Test Lots Instead
                  </button>
                </div>
              )}
            </div>

            <div className="row between" style={{ marginTop: 12, fontSize: 13, color: "var(--muted)" }}>
              <span>Auto-detects QR codes in view</span>
              {cameraStatus === "active" && (
                <button type="button" className="btn btn-sm" onClick={startCamera}>
                  ↻ Reset Camera
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Upload Photo */}
        {tab === "upload" && (
          <div>
            <div
              style={{
                border: "2px dashed var(--line-strong)",
                borderRadius: "var(--r)",
                padding: "36px 20px",
                textAlign: "center",
                background: "var(--surface-2)",
                cursor: "pointer",
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <span style={{ fontSize: 38, display: "block", marginBottom: 8 }}>🖼️</span>
              <b style={{ display: "block", fontSize: 16 }}>Select or drop a QR code image</b>
              <span className="small muted" style={{ display: "block", marginTop: 4 }}>
                Takes photos of waste lot stickers, printed labels, or screenshots
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              <button
                type="button"
                className="btn btn-sm btn-primary"
                style={{ marginTop: 16 }}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Browse image
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Test Samples / Instant Simulation */}
        {tab === "sample" && (
          <div>
            <p className="small muted" style={{ marginTop: 0, marginBottom: 12 }}>
              Click any waste lot tag below to simulate an instantaneous barcode scan:
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {DEMO_SAMPLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="card card-soft"
                  style={{
                    padding: 12,
                    textAlign: "left",
                    cursor: "pointer",
                    transition: "transform 0.15s, border-color 0.15s",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                  onClick={() => handleSuccess(String(s.id))}
                >
                  <div>
                    <div className="row between" style={{ marginBottom: 6 }}>
                      <span className="chip chip-neutral" style={{ fontSize: 11, padding: "2px 6px" }}>
                        #{s.id} · {s.cat}
                      </span>
                      <span className="small mono" style={{ fontSize: 11, color: "var(--muted)" }}>
                        {s.code}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3, color: "var(--ink)" }}>
                      {s.title}
                    </div>
                    <div className="small muted" style={{ marginTop: 3 }}>
                      {s.desc}
                    </div>
                  </div>

                  <div className="row between" style={{ marginTop: 10, alignItems: "center" }}>
                    {sampleQrs[s.id] ? (
                      <img
                        src={sampleQrs[s.id]}
                        alt={`QR ${s.id}`}
                        style={{ width: 44, height: 44, borderRadius: 6, border: "1px solid var(--line)" }}
                      />
                    ) : (
                      <div style={{ width: 44, height: 44, background: "var(--surface)", borderRadius: 6 }} />
                    )}
                    <span className="btn btn-sm btn-primary" style={{ fontSize: 12, padding: "4px 10px" }}>
                      Scan Lot →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Manual Lookup Footer */}
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualInput.trim()) {
                handleSuccess(manualInput.trim());
              }
            }}
            className="row"
            style={{ gap: 8 }}
          >
            <input
              className="input"
              style={{ fontSize: 13.5, padding: "8px 12px" }}
              placeholder="Or enter lot ID (e.g. 1, 5, 12, or /listing/7)…"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              aria-label="Direct listing ID or URL"
            />
            <button type="submit" className="btn btn-dark" style={{ padding: "8px 16px", fontSize: 13.5 }}>
              Open
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
