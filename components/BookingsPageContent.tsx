"use client";

import LogisticsCard from "@/components/LogisticsCard";
import EssentialsChecklist from "@/components/EssentialsChecklist";
import { useTranslation } from "@/lib/translations";

export default function BookingsPageContent() {
  const { t } = useTranslation();

  return (
    <div
      data-testid="bookings-page"
      className="flex flex-col flex-1 pb-16 px-4 pt-4 space-y-4"
    >
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
          {t.logisticsPageTitle}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t.logisticsPageSubtitle}
        </p>
      </div>

      <LogisticsCard />
      <EssentialsChecklist />
    </div>
  );
}
