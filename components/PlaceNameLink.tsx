"use client";

import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { placeTestIdSlug, resolvePlaceHref } from "@/lib/urlSafety";
import { useTranslation } from "@/lib/translations";

export interface PlaceNameLinkProps {
  placeId: string;
  name: string;
  websiteUrl?: string;
  mapsUrl?: string;
  className?: string;
  /** Typography variant for surrounding layout */
  variant?: "sm" | "md";
}

export default function PlaceNameLink({
  placeId,
  name,
  websiteUrl,
  mapsUrl,
  className,
  variant = "sm",
}: PlaceNameLinkProps) {
  const { t } = useTranslation();
  const href = resolvePlaceHref(websiteUrl, mapsUrl);
  const slug = placeTestIdSlug(placeId);
  const testId = href ? `place-name-link-${slug}` : `place-name-text-${slug}`;

  const textClass =
    variant === "md"
      ? "font-semibold text-sm text-foreground leading-tight truncate"
      : "font-bold text-xs text-foreground truncate";

  const label = `${name} (${t.viewOfficialSite}, ${t.opensInNewTab})`;

  if (!href) {
    return (
      <span
        dir="ltr"
        data-place-id={placeId}
        data-testid={testId}
        className={cn("inline-flex min-h-11 items-center max-w-full", textClass, className)}
      >
        {name}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      dir="ltr"
      data-place-id={placeId}
      data-testid={testId}
      aria-label={label}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "inline-flex min-h-11 items-center gap-1 max-w-full",
        "text-[#006400] dark:text-[#86df72] hover:underline underline-offset-2",
        textClass,
        className
      )}
    >
      <span className="truncate">{name}</span>
      <ExternalLink className="h-3 w-3 shrink-0 opacity-80" aria-hidden="true" />
    </a>
  );
}
