"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { translations } from "@/lib/translations";
import { useTripStore } from "@/stores/tripStore";

export default function LoginPage() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const locale = useTripStore((s) => s.locale);
  const t = translations[locale] ?? translations.en;

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Artificial delay on failure to rate-limit brute-force attempts
    const result = signIn(userName.trim(), password);

    if (result.ok) {
      router.replace("/");
    } else {
      await new Promise((r) => setTimeout(r, 500));
      setError(result.error ?? t.wrongPassword);
      setLoading(false);
    }
  };

  return (
    <div className="w-full px-6 py-12 flex flex-col gap-8">
      {/* Brand header */}
      <div className="text-center space-y-1">
        <div className="text-4xl font-extrabold tracking-tight text-[#006400] dark:text-[#86df72]">
          TripiAgent
        </div>
        <p className="text-sm text-muted-foreground">{t.loginTitle}</p>
      </div>

      {/* Sign-in form */}
      <form
        data-testid="login-form"
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t.loginUsernamePlaceholder}
          </label>
          <input
            data-testid="login-username-input"
            type="text"
            autoComplete="username"
            autoCapitalize="words"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder={t.loginUsernamePlaceholder}
            required
            className="w-full h-12 px-4 rounded-xl border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#006400] dark:focus:ring-[#86df72]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {t.loginPasswordPlaceholder}
          </label>
          <input
            data-testid="login-password-input"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.loginPasswordPlaceholder}
            required
            className="w-full h-12 px-4 rounded-xl border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#006400] dark:focus:ring-[#86df72]"
          />
        </div>

        {error && (
          <p
            data-testid="login-error-msg"
            className="text-xs text-destructive bg-destructive/10 rounded-xl px-3 py-2 text-center font-medium"
          >
            {error}
          </p>
        )}

        <button
          data-testid="login-submit-btn"
          type="submit"
          disabled={loading || !userName.trim() || !password}
          className="w-full h-12 rounded-xl bg-[#006400] hover:bg-[#004d00] dark:bg-[#86df72] dark:hover:bg-[#9df888] text-white dark:text-zinc-950 font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "…" : t.loginSubmitBtn}
        </button>
      </form>

      <p className="text-center text-[11px] text-muted-foreground/60">
        TripiAgent · Italy 2026 · Family Trip
      </p>
    </div>
  );
}
