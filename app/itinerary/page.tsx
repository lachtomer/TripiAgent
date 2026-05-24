import ItineraryCard from "@/components/ItineraryCard";
import MapPreview from "@/components/MapPreview";
import EssentialsChecklist from "@/components/EssentialsChecklist";
import SavedAttractionsList from "@/components/SavedAttractionsList";
import LogisticsCard from "@/components/LogisticsCard";

export default function ItineraryPage() {
  return (
    <div className="flex flex-col flex-1 p-4 space-y-6 pb-24 overflow-y-auto max-w-6xl mx-auto w-full">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Itinerary</h1>
        <p className="text-xs text-muted-foreground mt-1">Your daily travel plans, booking confirmations, and logistics</p>
      </div>

      {/* Responsive Grid: 1 column on mobile, 3 columns on tablet/desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 space-y-6">
          {/* Daily schedule planner */}
          <ItineraryCard />
        </div>
        
        <div className="space-y-6">
          {/* Map Preview block */}
          <MapPreview />

          {/* Essentials Checklist block */}
          <EssentialsChecklist />

          {/* Logistics & Booking References */}
          <LogisticsCard />

          {/* Saved Attractions & Custom POIs */}
          <SavedAttractionsList />
        </div>
      </div>
    </div>
  );
}
