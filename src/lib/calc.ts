import { type Entry } from "@/types";

export function calcAutoFields(entry: Partial<Entry>) {
  const likes = entry.likes ?? 0;
  const favorites = entry.favorites ?? 0;
  const comments = entry.comments ?? 0;
  const interactCount = likes + favorites + comments;

  const read = entry.readCount ?? 0;
  const platform = entry.platform;

  let tier: "" | "基础" | "进阶" | "高阶" = "";

  if (read > 0 && interactCount > 0) {
    if (platform === "小红书") {
      if (read >= 3000 && interactCount >= 60) tier = "高阶";
      else if (read >= 1500 && interactCount >= 30) tier = "进阶";
      else tier = "基础";
    } else if (platform === "抖音" || platform === "视频号") {
      if (read >= 6000 && interactCount >= 100) tier = "高阶";
      else if (read >= 3000 && interactCount >= 50) tier = "进阶";
      else tier = "基础";
    }
  }

  const rewardCount = tier === "高阶" ? 3 : tier === "进阶" ? 2 : tier === "基础" ? 1 : 0;

  return { interactCount, tier, rewardCount };
}

// Auth helpers
const AUTH_KEY = "jinbo_auth";

export function setUser(user: { region: string; role: string }) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function getUser(): { region: string; role: string } | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearUser() {
  localStorage.removeItem(AUTH_KEY);
}
