/** Curated Plan B backups per itinerary day (1-based) for Lake Garda default trip. */
export interface LakeGardaDayBackupEntry {
  bankId: string;
  reason: string;
  alternateFor?: string;
}

export const LAKE_GARDA_DAY_BACKUPS: Readonly<
  Record<number, readonly LakeGardaDayBackupEntry[]>
> = {
  3: [
    {
      bankId: "bank-caneva-aqua",
      reason: "Rain backup · same area",
      alternateFor: "Self-Drive Boat Rental",
    },
    {
      bankId: "bank-movieland",
      reason: "Indoor backup · Caneva park",
      alternateFor: "Self-Drive Boat Rental",
    },
    {
      bankId: "bank-jungle-adventure",
      reason: "Active backup · near Desenzano",
      alternateFor: "Rimbalzello Adventure Park",
    },
  ],
  6: [
    {
      bankId: "bank-caneva-aqua",
      reason: "Rain backup · water park",
      alternateFor: "Gardaland Theme Park",
    },
    {
      bankId: "bank-movieland",
      reason: "Indoor backup · same resort",
      alternateFor: "Gardaland Theme Park",
    },
  ],
  7: [
    {
      bankId: "bank-paragliding-malcesine",
      reason: "Cable car backup · book tandem flight",
      alternateFor: "Monte Baldo Cable Car",
    },
  ],
};
