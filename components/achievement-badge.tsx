"use client";

import { useEffect, useState } from "react";

interface AchievementBadgeProps {
  title: string;
  onClose: () => void;
}

export function AchievementBadge({ title, onClose }: AchievementBadgeProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top">
      <div className="flex items-center gap-3 rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3 shadow-lg dark:bg-yellow-950 dark:border-yellow-800">
        <span className="text-2xl">🏆</span>
        <div>
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
            Achievement Unlocked!
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">{title}</p>
        </div>
        <button
          onClick={() => { setVisible(false); onClose(); }}
          className="ml-2 text-yellow-600 hover:text-yellow-800"
          aria-label="Đóng"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
