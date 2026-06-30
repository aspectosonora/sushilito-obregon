import { MapPin, UtensilsCrossed, ShoppingBag, MessageCircle } from "lucide-react";

const steps = [
  { icon: MapPin, title: "Elige sucursal", desc: "Morelos, Guerrero, Tabasco o Casa Blanca" },
  { icon: UtensilsCrossed, title: "Selecciona productos", desc: "Arma tu pedido del menú" },
  { icon: ShoppingBag, title: "Revisa tu pedido", desc: "Cantidades, extras y total" },
  { icon: MessageCircle, title: "Envía por WhatsApp", desc: "Confirmamos y preparamos" },
];

export function HowToOrder() {
  return (
    <section className="mx-auto max-w-3xl px-4 mt-6">
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--brand-red)] font-bold">Cómo pedir</div>
          <h2 className="font-display text-2xl tracking-wide">ARMA TU PEDIDO</h2>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:inline">4 pasos rápidos</span>
      </div>
      <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={s.title} className="relative bg-white rounded-2xl p-3 border border-black/5 shadow-sm">
              <span className="absolute -top-2 -left-2 size-6 grid place-items-center rounded-full bg-[var(--brand-black)] text-white text-[11px] font-black border-2 border-white">
                {i + 1}
              </span>
              <div className="size-9 rounded-xl bg-[var(--brand-red)]/10 grid place-items-center mb-2">
                <Icon className="size-5 text-[var(--brand-red)]" />
              </div>
              <div className="font-bold text-[13px] leading-tight">{s.title}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{s.desc}</div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
