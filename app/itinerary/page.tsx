import ItineraryCard from "@/components/ItineraryCard";

export default function ItineraryPage() {
  return (
    <div className="flex flex-col flex-1 p-4 space-y-6 pb-24 overflow-y-auto max-w-6xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Itinerary</h1>
        <p className="text-xs text-muted-foreground mt-1">Your daily travel plans and schedule</p>
      </div>

      <ItineraryCard />
    </div>
  );
}
