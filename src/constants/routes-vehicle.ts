export type RouteGroup = 'all' | 'red' | 'green' | 'orange' | 'blue' | 'commuter' | 'bus';

export const ROUTE_TYPE_LABELS: Record<number, string> = {
  0: 'Light rail',
  1: 'Subway',
  2: 'Commuter rail',
  3: 'Bus',
  4: 'Ferry',
};

export const ROUTE_GROUPS: { id: RouteGroup; label: string }[] = [
  { id: 'all', label: 'Semua rute' },
  { id: 'red', label: 'Red Line' },
  { id: 'green', label: 'Green Line' },
  { id: 'orange', label: 'Orange Line' },
  { id: 'blue', label: 'Blue Line' },
  { id: 'commuter', label: 'Commuter Rail' },
  { id: 'bus', label: 'Bus' },
];
