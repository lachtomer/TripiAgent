import PackingList from "@/components/PackingList";

export const metadata = {
  title: "Pack | TripiAgent",
  description: "AI-powered packing list for your Italy trip",
};

export default function PackPage() {
  return (
    <div className="flex flex-col flex-1 p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Pack</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          AI-powered checklist — tailored to your itinerary
        </p>
      </div>

      <PackingList />
    </div>
  );
}
