"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DemoResetButton() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  async function handleReset() {
    setStatus(null);
    setIsResetting(true);

    try {
      const response = await fetch("/api/demo/reset", { method: "POST" });

      if (!response.ok) {
        setStatus("Demo 重置失败，请确认已运行 pnpm db:migrate。");
        return;
      }

      setStatus("Demo 数据已重置。");
      router.refresh();
    } catch {
      setStatus("Demo reset 请求失败。");
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="demo-reset">
      <button
        className="ghost-button"
        type="button"
        onClick={handleReset}
        disabled={isResetting}
      >
        {isResetting ? "重置中..." : "重置 Demo 数据"}
      </button>
      {status ? <span>{status}</span> : null}
    </div>
  );
}
