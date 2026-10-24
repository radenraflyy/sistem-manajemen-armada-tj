import type { Vehicle } from "../data-service/types";

type VehicleCardProps = {
  vehicle: Vehicle;
  onDetails: (vehicle: Vehicle) => void;
};

const VehicleCard = ({ vehicle, onDetails }: VehicleCardProps) => {
  const statusStyle =
    vehicle.status === "Bergerak"
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : vehicle.status === "Mendekati"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";
  const statusText =
    vehicle.status === "Bergerak"
      ? "Sedang berjalan"
      : vehicle.status === "Mendekati"
        ? "Mendekati halte"
        : "Berhenti di halte";
  const progressWidth =
    vehicle.progress >= 100
      ? "w-full"
      : vehicle.progress >= 75
        ? "w-11/12"
        : vehicle.progress >= 55
          ? "w-2/3"
          : "w-5/12";

  return (
    <article className="flex min-h-[270px] flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_2px_8px_rgb(15_23_42/4%)] transition-shadow hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`inline-flex min-h-7 min-w-9 shrink-0 items-center justify-center rounded-md px-1.5 text-[10px] font-bold text-white ${vehicle.routeColor}`}
          >
            {vehicle.route}
          </span>
          <h2 className="truncate text-base font-bold tracking-tight text-slate-800">
            TJ—{vehicle.number}
          </h2>
        </div>
        <span
          className={`inline-flex max-w-[138px] shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-semibold leading-tight ${statusStyle}`}
        >
          <span className="size-1.5 shrink-0 rounded-full bg-current" />
          {statusText}
        </span>
      </div>

      <div className="mt-4 min-h-[48px]">
        <p className="text-xs leading-relaxed text-slate-500">
          Tujuan:{" "}
          <strong className="font-semibold text-slate-700">
            {vehicle.destination}
          </strong>
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {vehicle.origin}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px]">
        <span className="font-medium text-slate-500">Progress trayek</span>
        <span className="font-semibold text-tj-blue">
          {vehicle.status === "Bergerak"
            ? `Bergerak (${vehicle.progress}%)`
            : vehicle.status === "Mendekati"
              ? "Mendekati halte"
              : "Docked"}
        </span>
      </div>
      <div
        aria-label={`Progress trayek ${vehicle.number}`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={vehicle.progress}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
      >
        <span
          className={`block h-full rounded-full bg-gradient-to-r from-tj-blue to-cyan-400 ${progressWidth}`}
        />
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-slate-200 rounded-xl bg-slate-50 px-1 py-3">
        <div className="px-2">
          <p className="text-[10px] text-slate-400">Kecepatan</p>
          <p className="mt-1 whitespace-nowrap text-xs font-semibold text-slate-700">
            {vehicle.speed} km/jam
          </p>
        </div>
        <div className="px-2">
          <p className="text-[10px] text-slate-400">Arah</p>
          <p className="mt-1 whitespace-nowrap text-xs font-semibold text-slate-700">
            {vehicle.direction}°
          </p>
        </div>
        <div className="px-2">
          <p className="text-[10px] text-slate-400">Kapasitas</p>
          <p className="mt-1 text-xs font-semibold text-emerald-600">
            {vehicle.capacity}%
          </p>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="truncate text-[11px] text-slate-400">
          {vehicle.coordinates}
        </span>
        <button
          className="shrink-0 rounded-lg border border-blue-100 bg-white px-3 py-2 text-[11px] font-semibold text-tj-blue transition hover:bg-blue-50 active:scale-[0.98]"
          onClick={() => onDetails(vehicle)}
          type="button"
        >
          Detail &amp; peta <span aria-hidden="true">›</span>
        </button>
      </div>
    </article>
  );
};

export default VehicleCard;
