"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

const THRESHOLD = 64;

export function PullToRefresh({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
}) {
  const startY = useRef(0);
  const pulling = useRef(false);
  const [offset, setOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY > 0 || refreshing) return;
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  }, [refreshing]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pulling.current || refreshing) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) {
      setOffset(Math.min(dy * 0.45, 88));
    }
  }, [refreshing]);

  const onTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;
    if (offset >= THRESHOLD) {
      setRefreshing(true);
      setOffset(48);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setOffset(0);
      }
    } else {
      setOffset(0);
    }
  }, [offset, onRefresh]);

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative"
    >
      <div
        className="pointer-events-none flex items-center justify-center text-xs text-violet-300 transition-opacity"
        style={{ height: offset, opacity: offset > 8 ? 1 : 0 }}
      >
        {refreshing ? "กำลังรีเฟรช…" : offset >= THRESHOLD ? "ปล่อยเพื่อรีเฟรช" : "ดึงลงเพื่อรีเฟรช"}
      </div>
      <div style={{ transform: offset && !refreshing ? `translateY(${Math.min(offset * 0.2, 12)}px)` : undefined }}>
        {children}
      </div>
    </div>
  );
}
