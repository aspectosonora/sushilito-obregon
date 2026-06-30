import { categories, products } from "@/data/menu";
import { ChevronRight, Soup, CircleDot, UtensilsCrossed, Baby, GlassWater, Flame, Layers } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  entradas: Soup,
  rollos: CircleDot,
  platillos: UtensilsCrossed,
  sopas: Flame,
  kids: Baby,
  bebidas: GlassWater,
};

export function CategoryGrid({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <section id="categorias" className="mx-auto max-w-3xl px-4 mt-8 scroll-mt-24">
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-[var(--brand-red)] font-black">Menú</div>
          <h2 className="font-display text-3xl tracking-wide">ELIGE UNA CATEGORÍA</h2>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground hidden sm:inline">
          {categories.length} categorías
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map(c => {
          const Icon = ICONS[c.id] ?? Layers;
          const count = products.filter(p => p.categoryId === c.id).length;
          const sample = products.find(p => p.categoryId === c.id);
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className="group relative overflow-hidden rounded-2xl bg-[var(--brand-black)] text-white text-left aspect-[4/3] shadow-md hover:shadow-xl transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]"
            >
              {sample && (
                <img src={sample.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:opacity-70 group-hover:scale-105 transition duration-500" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/10" />
              <div className="absolute top-2.5 left-2.5 size-10 grid place-items-center rounded-xl bg-[var(--brand-red)] shadow-lg shadow-[var(--brand-red)]/40 ring-2 ring-white/10">
                <Icon className="size-5 text-white" strokeWidth={2.4} />
              </div>
              <div className="absolute top-2.5 right-2.5 text-[9px] uppercase tracking-[0.18em] text-white/80 bg-white/10 backdrop-blur px-2 py-0.5 rounded-full border border-white/15">
                {count}
              </div>
              <div className="absolute bottom-0 inset-x-0 p-3">
                <div className="font-display text-xl sm:text-2xl leading-tight uppercase">{c.name}</div>
                {c.tagline && <div className="text-[10px] uppercase tracking-wider text-white/65 mt-0.5">{c.tagline}</div>}
                <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[var(--brand-gold)] font-bold">
                  Ver menú <ChevronRight className="size-3" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
