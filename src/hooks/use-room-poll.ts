"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/api-client";
import type { RoomView } from "@/core/application/views";

/** 1초 폴링 — 방 상태를 주기적으로 가져온다. refresh로 즉시 재조회(액션 직후). */
export function useRoomPoll(roomId: string, intervalMs = 1000) {
  const [view, setView] = useState<RoomView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const alive = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const v = await api.getRoom(roomId);
      if (alive.current) {
        setView(v);
        setError(null);
      }
    } catch (e) {
      if (alive.current) setError(e instanceof Error ? e.message : "오류");
    }
  }, [roomId]);

  useEffect(() => {
    alive.current = true;
    refresh();
    const t = setInterval(refresh, intervalMs);
    return () => {
      alive.current = false;
      clearInterval(t);
    };
  }, [refresh, intervalMs]);

  return { view, error, refresh, setView };
}
