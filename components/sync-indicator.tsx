"use client";

import { useEffect, useState } from "react";
import { getPendingTransactions, syncPendingTransactions } from "@/lib/offline-store";

type SyncStatus = "online" | "offline" | "syncing";

export function SyncIndicator() {
  const [status, setStatus] = useState<SyncStatus>("online");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const updateStatus = () => {
      setStatus(navigator.onLine ? "online" : "offline");
    };

    const checkPending = async () => {
      try {
        const pending = await getPendingTransactions();
        setPendingCount(pending.length);
      } catch {
        // IndexedDB not available
      }
    };

    const handleOnline = async () => {
      setStatus("syncing");
      await syncPendingTransactions();
      await checkPending();
      setStatus("online");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", updateStatus);

    updateStatus();
    checkPending();

    // Periodic check
    const interval = setInterval(checkPending, 10000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", updateStatus);
      clearInterval(interval);
    };
  }, []);

  if (status === "online" && pendingCount === 0) return null;

  const statusConfig = {
    online: { bg: "bg-green-100", text: "text-green-700", label: "Đã đồng bộ" },
    offline: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Ngoại tuyến" },
    syncing: { bg: "bg-blue-100", text: "text-blue-700", label: "Đang đồng bộ..." },
  };

  const config = statusConfig[status];

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-1 text-xs ${config.bg} ${config.text}`}>
      {status === "syncing" && (
        <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      )}
      <span>{config.label}</span>
      {pendingCount > 0 && <span>({pendingCount} chưa đồng bộ)</span>}
    </div>
  );
}
