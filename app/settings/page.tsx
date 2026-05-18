"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [preferences, setPreferences] = useState({
    inactivityReminder: true,
    jarWarning: true,
    goalReminder: true,
  });

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("Trình duyệt không hỗ trợ thông báo");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === "granted");
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <h1 className="text-xl font-bold mb-6">Cài đặt</h1>

      {/* Notification settings */}
      <section className="mb-8">
        <h2 className="font-semibold mb-4">Thông báo</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium">Bật thông báo</p>
              <p className="text-xs text-muted-foreground">Nhận nhắc nhở qua push notification</p>
            </div>
            <Button
              variant={notificationsEnabled ? "default" : "outline"}
              size="sm"
              onClick={requestNotificationPermission}
            >
              {notificationsEnabled ? "Đã bật" : "Bật"}
            </Button>
          </div>

          <div className="space-y-3 pl-2">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={preferences.inactivityReminder}
                onChange={(e) => setPreferences((p) => ({ ...p, inactivityReminder: e.target.checked }))}
                className="h-4 w-4 rounded border-border"
              />
              Nhắc nhở khi không ghi chép 2 ngày
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={preferences.jarWarning}
                onChange={(e) => setPreferences((p) => ({ ...p, jarWarning: e.target.checked }))}
                className="h-4 w-4 rounded border-border"
              />
              Cảnh báo hũ sắp hết
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={preferences.goalReminder}
                onChange={(e) => setPreferences((p) => ({ ...p, goalReminder: e.target.checked }))}
                className="h-4 w-4 rounded border-border"
              />
              Nhắc nhở nạp tiền tiết kiệm
            </label>
          </div>
        </div>
      </section>

      {/* App info */}
      <section>
        <h2 className="font-semibold mb-4">Thông tin</h2>
        <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
          <p>Quản lý Tài chính v0.1.0</p>
          <p className="mt-1">Ứng dụng quản lý tài chính cá nhân thông minh</p>
        </div>
      </section>
    </div>
  );
}
