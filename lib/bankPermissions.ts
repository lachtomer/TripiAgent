/** Display names allowed to delete shared bank / saved-attraction entries (BR-7). */
export const BANK_ADMIN_NAMES = ["Liran", "Tomer"] as const;

export type BankAdminName = (typeof BANK_ADMIN_NAMES)[number];

export function isBankAdminName(name: string | undefined | null): boolean {
  if (!name) return false;
  return (BANK_ADMIN_NAMES as readonly string[]).includes(name);
}

export function isBankAdminUser(
  user: { name: string; role: string } | undefined | null
): boolean {
  if (!user) return false;
  return user.role === "admin" || isBankAdminName(user.name);
}
