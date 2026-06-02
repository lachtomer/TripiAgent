import type { Metadata } from "next";
import SavedAttractionsList from "@/components/SavedAttractionsList";

export const metadata: Metadata = {
  title: "יעדים — TripiAgent",
  description: "Saved attractions and points of interest",
};

export default function LocationsPage() {
  return (
    <div className="flex flex-col flex-1 pb-16 px-4 pt-4">
      <SavedAttractionsList />
    </div>
  );
}
