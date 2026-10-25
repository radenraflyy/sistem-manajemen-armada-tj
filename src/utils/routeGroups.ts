import type { RouteGroup } from '../constants/routes-vehicle';

export type { RouteGroup } from '../constants/routes-vehicle';

type RouteGroupFields = {
  shortName: string;
  longName: string;
  type: number | null;
};

export function matchesRouteGroup(route: RouteGroupFields, group: RouteGroup): boolean {
  const shortName = route.shortName.toLocaleLowerCase();
  const text = `${route.shortName} ${route.longName}`.toLocaleLowerCase();

  if (group === 'all') return true;
  if (group === 'red') return text.includes('red line') || shortName === 'red';
  if (group === 'green') return text.includes('green line') || shortName.startsWith('green');
  if (group === 'orange') return text.includes('orange line') || shortName === 'orange';
  if (group === 'blue') return text.includes('blue line') || shortName === 'blue';

  return group === 'commuter' ? route.type === 2 : route.type === 3;
}
