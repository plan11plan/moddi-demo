import type { Clock } from "@/core/ports";

export class SystemClock implements Clock {
  now(): number {
    return Date.now();
  }
}
