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
  variant?: "sm" | "md" | "search";
  /** Lines before ellipsis; defaults to 2 for `search`, 1 otherwise */
  lineClamp?: 1 | 2;
}

export default function PlaceNameLink({
  placeId,
  name,
  websiteUrl,
  mapsUrl,
  className,
  variant = "sm",
  lineClamp,
}: PlaceNameLinkProps) {
  const { t } = useTranslation();
  const href = resolvePlaceHref(websiteUrl, mapsUrl);
  const slug = placeTestIdSlug(placeId);
  const testId = href ? `place-name-link-${slug}` : `place-name-text-${slug}`;

  const resolvedClamp = lineClamp ?? (variant === "search" ? 2 : 1);
  const clampClass = resolvedClamp === 2 ? "line-clamp-2" : "truncate";
  const isMultiLine = resolvedClamp === 2;

  const textClass =
    variant === "md"
      ? `font-semibold text-sm text-foreground leading-tight ${clampClass}`
      : variant === "search"
        ? `font-bold text-sm text-foreground leading-snug ${clampClass}`
        : `font-bold text-xs text-foreground ${clampClass}`;

  const layoutClass = isMultiLine
    ? "flex w-full min-w-0 items-start gap-1 overflow-hidden"
    : "inline-flex min-h-11 items-center max-w-full gap-1";

  const label = `${name} (${t.viewOfficialSite}, ${t.opensInNewTab})`;

  if (!href) {
    return (
      <span
        dir="ltr"
        data-place-id={placeId}
        data-testid={testId}
        className={cn(layoutClass, textClass, className)}
      >
        <span className={cn(clampClass, isMultiLine && "flex-1 min-w-0 break-words")}>{name}</span>
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
        layoutClass,
        "text-[#006400] dark:text-[#86df72] hover:underline underline-offset-2",
        textClass,
        className
      )}
    >
      <span className={cn(clampClass, isMultiLine && "flex-1 min-w-0 break-words")}>{name}</span>
      <ExternalLink
        className={cn("h-3 w-3 shrink-0 opacity-80", isMultiLine && "mt-0.5")}
        aria-hidden="true"
      />
    </a>
  );
}
