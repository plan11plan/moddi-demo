"use client";

import { useState, useEffect, useCallback } from "react";

/** 방별 신원 — 무로그인. localStorage(방ID별)에 저장해 새로고침에도 유지. */
export interface Identity {
  participantId?: string;
  nickname?: string;
  hostToken?: string; // 방을 생성한 브라우저에만 존재
}

const storageKey = (roomId: string) => `moddi:room:${roomId}`;

export function readIdentity(roomId: string): Identity {
  try {
    const raw = localStorage.getItem(storageKey(roomId));
    return raw ? (JSON.parse(raw) as Identity) : {};
  } catch {
    return {};
  }
}

export function writeIdentity(roomId: string, patch: Identity): Identity {
  const next = { ...readIdentity(roomId), ...patch };
  try {
    localStorage.setItem(storageKey(roomId), JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function useIdentity(roomId: string) {
  const [identity, setIdentity] = useState<Identity>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setIdentity(readIdentity(roomId));
    setLoaded(true);
  }, [roomId]);

  const update = useCallback(
    (patch: Identity) => setIdentity(writeIdentity(roomId, patch)),
    [roomId],
  );

  return {
    identity,
    loaded,
    update,
    isHost: !!identity.hostToken,
    isJoined: !!identity.participantId,
  };
}
