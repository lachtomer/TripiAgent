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
      bankId: "bank-movieland",
      reason: "Indoor rain backup · Lazise resort",
      alternateFor: "Parco Giardino Sigurtà",
    },
    {
      bankId: "bank-vittoriale",
      reason: "Museum backup · west lake",
      alternateFor: "Borghetto sul Mincio",
    },
  ],
  6: [
    {
      bankId: "bank-paragliding-malcesine",
      reason: "Cable car backup · book tandem flight",
      alternateFor: "Monte Baldo Cable Car",
    },
    {
      bankId: "bank-limone",
      reason: "West-shore village if cable car closed",
      alternateFor: "Monte Baldo Cable Car",
    },
  ],
  5: [
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
  4: [
    {
      bankId: "bank-tibetan-bridge",
      reason: "Gorge hike swap · teens thrill factor",
      alternateFor: "Manerba — Self-Drive Boat Rental",
    },
    {
      bankId: "bank-paganella-traverse",
      reason: "Ambitious Dolomites ridge · full day",
      alternateFor: "Manerba — Self-Drive Boat Rental",
    },
  ],
  7: [
    {
      bankId: "bank-bardolino",
      reason: "Village day swap · skip water park",
      alternateFor: "CanevaWorld Aqua Paradise",
    },
  ],
  8: [
    {
      bankId: "bank-movieland",
      reason: "Rain backup · indoor",
      alternateFor: "Manerba — Self-Drive Boat Rental",
    },
    {
      bankId: "bank-caneva-aqua",
      reason: "Rain backup · water park",
      alternateFor: "Manerba — Self-Drive Boat Rental",
    },
  ],
};
