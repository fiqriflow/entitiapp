export const LEVEL_OPTIONS = [
  { value: "newbie", label: "Newbie" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advance", label: "Advance" },
] as const;

export type LevelValue = (typeof LEVEL_OPTIONS)[number]["value"];

export const LEVEL_LABEL: Record<string, string> = Object.fromEntries(
  LEVEL_OPTIONS.map((o) => [o.value, o.label])
);

export function formatRupiah(value: number): string {
  if (value === 0) return "Gratis";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function levelIndex(level: string): number {
  return LEVEL_OPTIONS.findIndex((o) => o.value === level);
}

export function levelInRange(
  level: string | null | undefined,
  min: string,
  max: string
): boolean {
  if (!level) return false;
  const li = levelIndex(level);
  const lo = levelIndex(min);
  const hi = levelIndex(max);
  if (li === -1 || lo === -1 || hi === -1) return true;
  return li >= lo && li <= hi;
}

export function levelRangeLabel(min: string, max: string): string {
  if (min === max) return LEVEL_LABEL[min] ?? min;
  return `${LEVEL_LABEL[min] ?? min}–${LEVEL_LABEL[max] ?? max}`;
}

export function isMabarCompleted(
  eventDate: string,
  completionOverride: "selesai" | "belum" | null | undefined
): boolean {
  if (completionOverride === "selesai") return true;
  if (completionOverride === "belum") return false;
  const today = new Date().toISOString().slice(0, 10);
  return eventDate < today;
}

const NICKNAME_LOGIN_DOMAIN = "entiti.local";

export function normalizeNickname(nickname: string): string {
  return nickname.trim().toLowerCase().replace(/\s+/g, "");
}

export function nicknameToEmail(nickname: string): string {
  return `${normalizeNickname(nickname)}@${NICKNAME_LOGIN_DOMAIN}`;
}

// Dipakai untuk cek apakah user baru (biasanya dari login Google) sudah
// mengisi data wajib. Kalau belum, dia dipaksa ke /onboarding dulu.
export type ProfileCompleteness = {
  full_name?: string | null;
  nickname?: string | null;
  whatsapp?: string | null;
  gender?: string | null;
  instagram?: string | null;
} | null | undefined;

export function isProfileComplete(player: ProfileCompleteness): boolean {
  if (!player) return false;
  return Boolean(
    player.full_name &&
      player.nickname &&
      player.whatsapp &&
      player.gender &&
      player.instagram
  );
}
