import { useCallback, useEffect, useRef, useState } from 'react';

import {
  AttributionControl,
  type GeoJSONSource,
  LngLatBounds,
  Map,
  type MapLayerMouseEvent,
  type Map as MapLibreMap,
  type MapMouseEvent,
  NavigationControl,
  Popup,
  setWorkerUrl,
} from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import 'maplibre-gl/dist/maplibre-gl.css';

import type { Vehicle } from '@/types/fleet';

const MIN_ZOOM = 9;
const MAX_ZOOM = 18;
const INITIAL_CENTER: [number, number] = [-71.0589, 42.3601];
const VEHICLE_SOURCE = 'vehicles';
const ROUTE_SOURCE = 'routes';
const vehicleStatuses = ['Berjalan', 'Berhenti', 'Mendekati', 'Tidak diketahui'] as const;
const vehicleKinds = ['bus', 'rail', 'ferry'] as const;
const markerColors: Record<(typeof vehicleStatuses)[number], string> = {
  Berjalan: '#2563eb',
  Berhenti: '#059669',
  Mendekati: '#d97706',
  'Tidak diketahui': '#64748b',
};

setWorkerUrl(maplibreWorkerUrl);

type InteractiveMapProps = {
  vehicles: Vehicle[];
  onVehicleDetails?: (vehicle: Vehicle) => void;
  onVehicleSelect?: (vehicle: Vehicle | null) => void;
  selectedVehicleId?: string | null;
  className?: string;
  showLegend?: boolean;
  variant?: 'overview' | 'detail';
};

function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  while (index < encoded.length) {
    const readDelta = () => {
      let result = 0;
      let shift = 0;
      let byte: number;
      do {
        if (index >= encoded.length) return null;
        byte = encoded.charCodeAt(index++) - 63;
        if (byte < 0 || byte > 63 || shift > 30) return null;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      return result & 1 ? ~(result >> 1) : result >> 1;
    };

    const latDelta = readDelta();
    const lngDelta = readDelta();
    if (latDelta === null || lngDelta === null) return [];
    latitude += latDelta;
    longitude += lngDelta;
    points.push([longitude / 1e5, latitude / 1e5]);
  }
  return points;
}

function featureCollections(vehicles: Vehicle[]) {
  const vehicleFeatures = vehicles.flatMap((vehicle) => {
    if (vehicle.latitude === null || vehicle.longitude === null) return [];
    const color = markerColors[vehicle.status];
    const kind =
      vehicle.routeDetails.type === 3 ? 'bus' : vehicle.routeDetails.type === 4 ? 'ferry' : 'rail';
    return [
      {
        type: 'Feature' as const,
        id: vehicle.id,
        geometry: { type: 'Point' as const, coordinates: [vehicle.longitude, vehicle.latitude] },
        properties: { vehicleId: vehicle.id, color, icon: `vehicle-${kind}-${vehicle.status}` },
      },
    ];
  });

  const seenShapes = new Set<string>();
  const routeFeatures = vehicles.flatMap((vehicle) => {
    const key = vehicle.shapeId ?? vehicle.id;
    if (!vehicle.routePolyline || seenShapes.has(key)) return [];
    seenShapes.add(key);
    const coordinates = decodePolyline(vehicle.routePolyline);
    if (coordinates.length < 2) return [];
    return [
      {
        type: 'Feature' as const,
        geometry: { type: 'LineString' as const, coordinates },
        properties: { color: vehicle.routeDetails.color ?? '#475569' },
      },
    ];
  });

  return {
    vehicleData: { type: 'FeatureCollection' as const, features: vehicleFeatures },
    routeData: { type: 'FeatureCollection' as const, features: routeFeatures },
  };
}

function makeVehicleMarker(color: string, kind: (typeof vehicleKinds)[number]) {
  const canvas = document.createElement('canvas');
  canvas.width = 72;
  canvas.height = 72;
  const context = canvas.getContext('2d');
  if (!context) return null;

  context.scale(2, 2);
  context.beginPath();
  context.arc(18, 18, 16, 0, Math.PI * 2);
  context.fillStyle = color;
  context.fill();
  context.lineWidth = 2;
  context.strokeStyle = '#fff';
  context.stroke();
  context.lineWidth = 1.8;
  context.strokeStyle = '#fff';
  context.lineCap = 'round';
  context.lineJoin = 'round';

  if (kind === 'bus') {
    context.beginPath();
    context.roundRect(11, 8, 14, 17, 3);
    context.stroke();
    context.beginPath();
    context.moveTo(12, 14);
    context.lineTo(24, 14);
    context.moveTo(12, 20);
    context.lineTo(24, 20);
    context.moveTo(12, 25);
    context.lineTo(10, 28);
    context.moveTo(24, 25);
    context.lineTo(26, 28);
    context.stroke();
    context.fillStyle = '#fff';
    context.beginPath();
    context.arc(14, 17, 0.8, 0, Math.PI * 2);
    context.arc(22, 17, 0.8, 0, Math.PI * 2);
    context.fill();
  } else if (kind === 'ferry') {
    context.beginPath();
    context.moveTo(8, 20);
    context.lineTo(28, 20);
    context.lineTo(24, 26);
    context.lineTo(12, 26);
    context.closePath();
    context.stroke();
    context.strokeRect(13, 11, 10, 9);
    context.beginPath();
    context.moveTo(18, 7);
    context.lineTo(18, 11);
    context.moveTo(13, 15);
    context.lineTo(23, 15);
    context.stroke();
  } else {
    context.beginPath();
    context.moveTo(11, 25);
    context.lineTo(11, 14);
    context.quadraticCurveTo(11, 8, 18, 8);
    context.quadraticCurveTo(25, 8, 25, 14);
    context.lineTo(25, 25);
    context.closePath();
    context.stroke();
    context.beginPath();
    context.moveTo(12, 16);
    context.lineTo(24, 16);
    context.moveTo(12, 21);
    context.lineTo(24, 21);
    context.moveTo(14, 27);
    context.lineTo(11, 30);
    context.moveTo(22, 27);
    context.lineTo(25, 30);
    context.stroke();
  }

  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function fitVehicles(map: MapLibreMap, vehicles: Vehicle[]) {
  const coordinates = vehicles
    .filter((vehicle) => vehicle.latitude !== null && vehicle.longitude !== null)
    .map(
      (vehicle) => [vehicle.longitude as number, vehicle.latitude as number] as [number, number],
    );
  if (coordinates.length === 0) return;
  if (coordinates.length === 1) {
    map.flyTo({ center: coordinates[0], zoom: 14, duration: 650 });
    return;
  }
  const bounds = coordinates.reduce(
    (result, coordinate) => result.extend(coordinate),
    new LngLatBounds(coordinates[0], coordinates[0]),
  );
  map.fitBounds(bounds, { padding: 70, maxZoom: 14, duration: 650 });
}

function makePopup(vehicle: Vehicle, onDetails?: (vehicle: Vehicle) => void) {
  const content = document.createElement('div');
  content.className = 'min-w-44 p-1 font-sans';
  const title = document.createElement('strong');
  title.className = 'block text-sm text-slate-800';
  title.textContent = `Armada ${vehicle.number}`;
  const route = document.createElement('p');
  route.className = 'mt-1 text-xs text-slate-600';
  route.textContent = `Rute ${vehicle.route} · ${vehicle.status}`;
  const destination = document.createElement('p');
  destination.className = 'mt-1 text-xs text-slate-500';
  destination.textContent = vehicle.destination;
  content.append(title, route, destination);
  if (onDetails) {
    const button = document.createElement('button');
    button.className = 'mt-2 text-xs font-semibold text-blue-700';
    button.textContent = 'Detail kendaraan ›';
    button.addEventListener('click', () => onDetails(vehicle));
    content.append(button);
  }
  return content;
}

function createPopup(vehicle: Vehicle, onDetails?: (vehicle: Vehicle) => void) {
  return new Popup({ closeButton: true, offset: 14 })
    .setLngLat([vehicle.longitude as number, vehicle.latitude as number])
    .setDOMContent(makePopup(vehicle, onDetails));
}

function InteractiveMap({
  vehicles,
  onVehicleDetails,
  onVehicleSelect,
  selectedVehicleId = null,
  className = 'h-140',
  showLegend = true,
  variant = 'overview',
}: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const popupRef = useRef<Popup | null>(null);
  const vehiclesRef = useRef(vehicles);
  const selectedVehicleIdRef = useRef(selectedVehicleId);
  const detailsRef = useRef(onVehicleDetails);
  const selectRef = useRef(onVehicleSelect);
  const fittedInitialDataRef = useRef(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    vehiclesRef.current = vehicles;
    selectedVehicleIdRef.current = selectedVehicleId;
    detailsRef.current = onVehicleDetails;
    selectRef.current = onVehicleSelect;
  }, [onVehicleDetails, onVehicleSelect, selectedVehicleId, vehicles]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const map = new Map({
      container,
      center: INITIAL_CENTER,
      zoom: 12,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      attributionControl: false,
      style: {
        version: 8,
        sources: {
          osm: {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
            maxzoom: 19,
          },
        },
        layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
      },
    });
    mapRef.current = map;
    map.addControl(new NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new AttributionControl({ compact: true }), 'bottom-right');
    map.on('error', (event) => {
      console.error('MapLibre gagal merender peta:', event.error);
      setMapError(event.error.message);
    });

    map.on('load', () => {
      for (const status of vehicleStatuses) {
        for (const kind of vehicleKinds) {
          const icon = makeVehicleMarker(markerColors[status], kind);
          if (icon) map.addImage(`vehicle-${kind}-${status}`, icon, { pixelRatio: 2 });
        }
      }
      map.addSource(ROUTE_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'route-lines',
        type: 'line',
        source: ROUTE_SOURCE,
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 3,
          'line-opacity': 0.72,
        },
      });
      map.addSource(VEHICLE_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.addLayer({
        id: 'vehicle-points',
        type: 'symbol',
        source: VEHICLE_SOURCE,
        layout: {
          'icon-image': ['get', 'icon'],
          'icon-size': ['interpolate', ['linear'], ['zoom'], 9, 0.6, 15, 1],
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      });
      const { vehicleData, routeData } = featureCollections(vehiclesRef.current);
      (map.getSource(VEHICLE_SOURCE) as GeoJSONSource).setData(vehicleData as never);
      (map.getSource(ROUTE_SOURCE) as GeoJSONSource).setData(routeData as never);
      if (vehicleData.features.length && !fittedInitialDataRef.current) {
        fitVehicles(map, vehiclesRef.current);
        fittedInitialDataRef.current = true;
      }
      map.on('click', 'vehicle-points', (event: MapLayerMouseEvent) => {
        const vehicleId = event.features?.[0]?.properties?.vehicleId;
        const vehicle = vehiclesRef.current.find((item) => item.id === vehicleId);
        if (!vehicle || vehicle.latitude === null || vehicle.longitude === null) return;
        if (selectRef.current) {
          selectRef.current(vehicle);
          return;
        }
        popupRef.current?.remove();
        popupRef.current = new Popup({ closeButton: true, offset: 14 })
          .setLngLat([vehicle.longitude, vehicle.latitude])
          .setDOMContent(makePopup(vehicle, detailsRef.current))
          .addTo(map);
      });
      map.on('mouseenter', 'vehicle-points', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'vehicle-points', () => {
        map.getCanvas().style.cursor = '';
      });
      map.on('click', (event: MapMouseEvent) => {
        if (map.queryRenderedFeatures(event.point, { layers: ['vehicle-points'] }).length) return;
        popupRef.current?.remove();
        popupRef.current = null;
        selectRef.current?.(null);
      });
    });

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    const { vehicleData, routeData } = featureCollections(vehicles);
    (map.getSource(VEHICLE_SOURCE) as GeoJSONSource | undefined)?.setData(vehicleData as never);
    (map.getSource(ROUTE_SOURCE) as GeoJSONSource | undefined)?.setData(routeData as never);
    const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleIdRef.current);
    if (
      selectedVehicle &&
      selectedVehicle.latitude !== null &&
      selectedVehicle.longitude !== null &&
      popupRef.current
    ) {
      popupRef.current
        .setLngLat([selectedVehicle.longitude, selectedVehicle.latitude])
        .setDOMContent(makePopup(selectedVehicle, detailsRef.current));
    }
    if (!fittedInitialDataRef.current && vehicleData.features.length) {
      fitVehicles(map, vehicles);
      fittedInitialDataRef.current = true;
    }
  }, [vehicles]);

  const showSelectedVehicle = useCallback((vehicle: Vehicle) => {
    const map = mapRef.current;
    if (!map || vehicle.latitude === null || vehicle.longitude === null) return;
    map.flyTo({
      center: [vehicle.longitude, vehicle.latitude],
      zoom: Math.max(map.getZoom(), 14),
      duration: 500,
    });
    popupRef.current?.remove();
    const popup = createPopup(vehicle, detailsRef.current);
    popup.on('close', () => {
      if (popupRef.current === popup) {
        popupRef.current = null;
        selectRef.current?.(null);
      }
    });
    popupRef.current = popup.addTo(map);
  }, []);

  useEffect(() => {
    if (!selectedVehicleId) {
      popupRef.current?.remove();
      popupRef.current = null;
      return;
    }
    const vehicle = vehiclesRef.current.find((item) => item.id === selectedVehicleId);
    if (vehicle) showSelectedVehicle(vehicle);
  }, [selectedVehicleId, showSelectedVehicle]);

  return (
    <section
      className={`relative isolate overflow-hidden rounded-2xl border border-slate-200 bg-[#e8edf0] shadow-sm ${className}`}
      aria-label='Peta interaktif armada'
    >
      <div ref={containerRef} className='h-full w-full' />
      {mapError && (
        <div
          className='absolute inset-x-3 top-3 z-20 rounded-lg border border-amber-200 bg-white/95 px-3 py-2 text-xs text-amber-900 shadow-sm'
          role='status'
        >
          Peta gagal dimuat. Periksa koneksi internet, lalu muat ulang halaman.
        </div>
      )}
      {variant === 'overview' && (
        <>
          <button
            className='absolute bottom-3 left-3 z-10 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-xs font-semibold text-tj-blue shadow-sm hover:bg-white'
            onClick={() => {
              const map = mapRef.current;
              if (map) fitVehicles(map, vehicles);
            }}
            type='button'
          >
            Tampilkan semua
          </button>
          {showLegend && (
            <div className='absolute bottom-3 right-14 z-10 hidden items-center gap-2 rounded-lg border border-slate-200 bg-white/95 px-3 py-2 text-[10px] text-slate-600 shadow-sm sm:flex'>
              <span className='inline-flex items-center gap-1'>
                <span className='size-2 rounded-full bg-blue-600' /> Berjalan
              </span>
              <span className='inline-flex items-center gap-1'>
                <span className='size-2 rounded-full bg-emerald-600' /> Berhenti
              </span>
              <span className='inline-flex items-center gap-1'>
                <span className='size-2 rounded-full bg-amber-600' /> Mendekati
              </span>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default InteractiveMap;
