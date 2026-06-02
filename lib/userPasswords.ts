/**
 * v1 password verification: password equals username (case-insensitive).
 * Intentionally simple for a trusted group; no userId needed.
 */
export function checkPassword(userName: string, password: string): boolean {
  return password.trim().toLowerCase() === userName.trim().toLowerCase();
}
