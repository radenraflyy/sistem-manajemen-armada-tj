export type VehicleStatus = 'Berjalan' | 'Berhenti' | 'Mendekati' | 'Tidak diketahui';

export type Vehicle = {
  id: string;
  number: string;
  route: string;
  routeId: string | null;
  routeColor: string;
  routeDetails: {
    id: string | null;
    longName: string | null;
    description: string | null;
    type: number | null;
    color: string | null;
    directionDestinations: string[];
    directionNames: string[];
  };
  shapeId: string | null;
  routePolyline: string | null;
  destination: string;
  origin: string;
  stopId: string | null;
  status: VehicleStatus;
  currentStatus: string | null;
  currentStopSequence: number | null;
  directionId: number | null;
  speedKph: number | null;
  bearing: number | null;
  occupancy: string;
  occupancyStatus: string | null;
  coordinates: string;
  latitude: number | null;
  longitude: number | null;
  updatedAt: string | null;
  tripId: string | null;
  tripDetails: {
    id: string | null;
    headsign: string | null;
    name: string | null;
    directionId: number | null;
    blockId: string | null;
    wheelchairAccessible: number | null;
    bikesAllowed: number | null;
  };
  carriageLabels: string[];
  revenue: string | null;
};

export type RouteOption = {
  id: string;
  label: string;
  shortName: string;
  longName: string;
  color: string | null;
};

export type TripOption = {
  id: string;
  label: string;
  routeId: string | null;
};

export type RouteRow = {
  id: string;
  shortName: string;
  longName: string;
  type: number | null;
  color: string | null;
  directionNames: string[];
};

export type TripRow = {
  id: string;
  routeId: string | null;
  routeName: string;
  headsign: string;
  directionId: number | null;
  startTime: string | null;
  endTime: string | null;
  wheelchairAccessible: number | null;
};

export type VehicleSummary = {
  total: number;
  moving: number;
  stopped: number;
  approaching: number;
  routes: number;
  vehiclesByRoute: Record<string, number>;
  activeTrips: { id: string; routeId: string }[];
};
