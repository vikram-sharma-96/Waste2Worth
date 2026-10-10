import { useEffect, useState } from "react";

const STORAGE_KEY = "w2w.scan_history";

export const DEFAULT_SCANS = [
  { id: 1, scannedAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(), tag: "W2W-LOT-0001" },
  { id: 7, scannedAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(), tag: "W2W-LOT-0007" },
  { id: 5, scannedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), tag: "W2W-LOT-0005" },
];

export function getScanHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Initialize with default demo history
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SCANS));
      return DEFAULT_SCANS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SCANS;
  } catch (_) {
    return DEFAULT_SCANS;
  }
}

export function recordScan(listingId, tag) {
  const idNum = Number(listingId);
  if (!idNum || isNaN(idNum)) return;

  try {
    const current = getScanHistory();
    const updated = [
      {
        id: idNum,
        scannedAt: new Date().toISOString(),
        tag: tag || `W2W-LOT-${String(idNum).padStart(4, "0")}`,
      },
      ...current.filter((item) => Number(item.id) !== idNum),
    ].slice(0, 30);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("w2w:scan_history_updated", { detail: updated }));
  } catch (err) {
    console.warn("Failed to record scan history:", err);
  }
}

export function removeScan(listingId) {
  const idNum = Number(listingId);
  try {
    const current = getScanHistory();
    const updated = current.filter((item) => Number(item.id) !== idNum);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("w2w:scan_history_updated", { detail: updated }));
  } catch (err) {
    console.warn("Failed to remove scan:", err);
  }
}

export function clearScanHistory() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new CustomEvent("w2w:scan_history_updated", { detail: [] }));
  } catch (err) {
    console.warn("Failed to clear scan history:", err);
  }
}

export function useScanHistory() {
  const [history, setHistory] = useState(() => getScanHistory());

  useEffect(() => {
    const handler = () => {
      setHistory(getScanHistory());
    };
    window.addEventListener("w2w:scan_history_updated", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("w2w:scan_history_updated", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return {
    history,
    recordScan,
    removeScan,
    clearScanHistory,
  };
}
