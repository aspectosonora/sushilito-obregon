import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Clock, Check } from "lucide-react";
import { AppHeader } from "@/components/menu/AppHeader";
import { sucursales } from "@/data/menu";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/sucursales")({
  head: () => ({ meta: [{ title: "Sucursales — Sushilito Obregón" }] }),
  component: SucursalesPage,
});

function SucursalesPage() {
  const { sucursal, setSucursalId } = useStore();
  return (
    <div className="min-h-screen pb-20">
      <AppHeader />
      <div className="mx-auto max-w-2xl px-4 pt-5">
        <h1 className="font-display text-3xl">Sucursales</h1>
        <p className="text-sm text-muted-foreground">Elige la sucursal desde la que quieres ordenar.</p>
        <div className="grid sm:grid-cols-2 gap-3 mt-5">
          {sucursales.map(s => {
            const active = s.id === sucursal.id;
            return (
              <div key={s.id} className={`rounded-2xl border p-4 transition ${active ? "border-[var(--brand-red)] bg-[var(--brand-red)]/5" : "border-border bg-card"}`}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-lg">{s.name}</h3>
                  {active && <span className="chip-pill bg-[var(--brand-red)] text-white"><Check className="size-3" />Actual</span>}
                </div>
                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2"><MapPin className="size-4 mt-0.5 shrink-0 text-[var(--brand-gold)]" /><span>{s.address}</span></div>
                  <div className="flex items-center gap-2"><Phone className="size-4 text-[var(--brand-gold)]" /><span>{s.phone}</span></div>
                  <div className="flex items-center gap-2"><Clock className="size-4 text-[var(--brand-gold)]" /><span>{s.hours}</span></div>
                </div>
                <button
                  onClick={() => setSucursalId(s.id)}
                  disabled={active}
                  className="mt-4 w-full bg-[var(--brand-black)] disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[var(--brand-red)] transition"
                >
                  {active ? "Sucursal seleccionada" : "Elegir esta sucursal"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
