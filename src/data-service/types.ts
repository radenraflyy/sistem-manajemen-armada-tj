export type VehicleStatus = "Bergerak" | "Berhenti" | "Mendekati";

export type Vehicle = {
  id: string;
  number: string;
  route: string;
  routeColor: string;
  destination: string;
  origin: string;
  status: VehicleStatus;
  progress: number;
  speed: number;
  direction: number;
  capacity: number;
  coordinates: string;
};


export type QueriesDataService<T extends string> = {
  [key in T]: string;
};
