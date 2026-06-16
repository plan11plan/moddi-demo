"use client";

import { useRouter } from "next/navigation";
import { CreateScreen, type CreateConfig } from "@/components/modi";
import { api } from "@/lib/api-client";
import { writeIdentity } from "@/hooks/use-identity";

export default function CreatePage() {
  const router = useRouter();

  async function handleSubmit(config: CreateConfig) {
    const timerMinutes = Number(config.voteTime.replace("분", "")) || 3;
    try {
      const { roomId, hostToken } = await api.createRoom({
        title: config.name,
        location: config.location,
        headcount: config.size,
        budget: config.budget,
        timerMinutes,
      });
      writeIdentity(roomId, { hostToken });
      router.push(`/room/${roomId}`);
    } catch {
      // 실패 시 폼에 머무름 (드문 케이스)
      router.refresh();
    }
  }

  return <CreateScreen onSubmit={handleSubmit} onBack={() => router.push("/")} />;
}
