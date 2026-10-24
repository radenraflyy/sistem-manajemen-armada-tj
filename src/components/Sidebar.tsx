import type { VehicleStatus } from "../data-service/types";

type StatusFilter = "Semua" | VehicleStatus;

type OperationalCounts = {
  total: number;
  moving: number;
  stopped: number;
  approaching: number;
};

type SidebarProps = {
  routes: string[];
  operationalCounts: OperationalCounts;
  selectedRoutes: string[];
  statusFilter: StatusFilter;
  tripFilter: string;
  onReset: () => void;
  onSelectAllRoutes: () => void;
  onFocusRoute: () => void;
  onStatusChange: (status: StatusFilter) => void;
  onTripFilterChange: (filter: string) => void;
  onRouteToggle: (route: string) => void;
  onExport: () => void;
};

const Sidebar = ({
  routes,
  operationalCounts,
  selectedRoutes,
  statusFilter,
  tripFilter,
  onReset,
  onSelectAllRoutes,
  onFocusRoute,
  onStatusChange,
  onTripFilterChange,
  onRouteToggle,
  onExport,
}: SidebarProps) => {
  const statusOptions: { label: string; value: StatusFilter }[] = [
    { label: "Semua armada", value: "Semua" },
    { label: "Sedang berjalan", value: "Bergerak" },
    { label: "Berhenti di halte", value: "Berhenti" },
    { label: "Mendekati halte", value: "Mendekati" },
  ];

  return (
    <aside className="border-b border-slate-200 bg-white p-5 lg:min-h-screen lg:border-b-0 lg:border-r lg:p-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xs font-bold tracking-wide text-slate-700">
          <span className="text-base text-tj-blue" aria-hidden="true">
            ◈
          </span>
          FILTER &amp; KONTROL
        </h2>
        <button
          className="text-xs font-semibold text-tj-blue hover:underline"
          onClick={onReset}
          type="button"
        >
          Reset
        </button>
      </div>

      <section className="mt-6 border-t border-slate-100 pt-5">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">
          Status operasional
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {statusOptions.map(({ label, value }) => {
            const active = statusFilter === value;
            return (
              <button
                aria-pressed={active}
                className={`rounded-lg border px-2.5 py-2.5 text-left text-xs font-medium transition active:scale-[0.98] ${
                  active
                    ? "border-blue-200 bg-blue-50 text-tj-blue"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
                key={value}
                onClick={() => onStatusChange(value)}
                type="button"
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6 border-t border-slate-100 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">
            Rute / koridor
          </h3>
          <button
            className="text-xs text-tj-blue hover:underline"
            onClick={onSelectAllRoutes}
            type="button"
          >
            Pilih semua
          </button>
        </div>
        <div className="max-h-52 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
          {routes.map((route) => (
            <label
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-slate-600 hover:bg-slate-50"
              key={route}
            >
              <input
                checked={selectedRoutes.includes(route)}
                className="size-4 accent-tj-blue"
                onChange={() => onRouteToggle(route)}
                type="checkbox"
              />
              <span
                className={`inline-flex min-w-9 justify-center rounded-md px-1.5 py-1 text-[10px] font-bold text-white ${
                  route === "D"
                    ? "bg-emerald-500"
                    : route === "Shuttle"
                      ? "bg-orange-500"
                      : "bg-amber-500"
                }`}
              >
                {route}
              </span>
              <span className="truncate">Koridor {route}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="mt-6 border-t border-slate-100 pt-5">
        <label
          className="mb-2 block text-sm font-semibold text-slate-700"
          htmlFor="trip-filter"
        >
          Filter kode trip
        </label>
        <select
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          id="trip-filter"
          onChange={(event) => onTripFilterChange(event.target.value)}
          value={tripFilter}
        >
          <option value="all">Semua kode perjalanan</option>
          <option value="scheduled">Terjadwal</option>
          <option value="shuttle">Shuttle</option>
        </select>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
          onClick={onExport}
          type="button"
        >
          ↓ &nbsp; Ekspor log
        </button>
        <button
          className="rounded-lg bg-blue-50 px-3 py-2.5 text-xs font-semibold text-tj-blue transition hover:bg-blue-100 active:scale-[0.98]"
          onClick={onFocusRoute}
          type="button"
        >
          ◫ &nbsp; Fokus rute
        </button>
      </div>

      <section className="mt-7" aria-labelledby="network-title">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3
            id="network-title"
            className="text-[11px] font-bold tracking-widest text-slate-500"
          >
            METRIK OPERASIONAL
          </h3>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
            98.4% Normal
          </span>
        </div>
        <div className="rounded-xl bg-linear-to-br from-tj-navy to-tj-blue p-4 text-white shadow-sm">
          <div className="flex items-center justify-between text-xs text-blue-100">
            <span>Total armada jaringan</span>
            <span className="size-2 rounded-full bg-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <strong className="text-3xl leading-none">
              {operationalCounts.total}
            </strong>
            <span className="text-xs text-blue-100">unit armada</span>
          </div>
          <p className="mt-2 text-xs text-blue-100">
            Armada terdaftar pada jaringan
          </p>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          ["BERJALAN", String(operationalCounts.moving), "Kecepatan rata-rata", "text-blue-600"],
          ["DI HALTE", String(operationalCounts.stopped), "Armada berhenti", "text-emerald-600"],
          ["KETEPATAN", "94.8%", "On-time performance", "text-cyan-600"],
          ["MENDEKATI", String(operationalCounts.approaching), "Estimasi < 2 menit", "text-amber-600"],
        ].map(([label, value, caption, color]) => (
          <div
            className="rounded-xl border border-slate-200 bg-white p-3"
            key={label}
          >
            <p className="text-[10px] font-bold tracking-wide text-slate-400">
              {label}
            </p>
            <p className={`mt-1 text-xl font-bold ${color}`}>{value}</p>
            <p className="mt-0.5 text-[10px] text-slate-400">{caption}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
        <p className="text-xs font-semibold text-slate-700">
          TJ &nbsp; Call Center Operasional
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          OCC · 1500-102 · Radio CH-04
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
