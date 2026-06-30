import { useEffect, useRef } from "react";
import { categories } from "@/data/menu";
import { cn } from "@/lib/utils";
import { Flame, Soup, CircleDot, Star, UtensilsCrossed, Baby, GlassWater, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  promos: Flame,
  entradas: Soup,
  rollos: CircleDot,
  especiales: Star,
  platillos: UtensilsCrossed,
  kids: Baby,
  bebidas: GlassWater,
  extras: Plus,
};

export function CategoryNav({ activeId, onSelect }: { activeId: string; onSelect: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = document.querySelector<HTMLButtonElement>(`[data-cat="${activeId}"]`);
    node?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeId]);

  return (
    <div
      ref={ref}
      className="sticky top-[64px] z-30 bg-white/95 backdrop-blur border-b border-black/5"
    >
      <div className="mx-auto max-w-3xl">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-3 py-2.5">
          {categories.map(c => {
            const Icon = ICONS[c.id] ?? CircleDot;
            const active = c.id === activeId;
            return (
              <button
                key={c.id}
                data-cat={c.id}
                onClick={() => onSelect(c.id)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap transition border-2",
                  active
                    ? "bg-[var(--brand-red)] text-white border-[var(--brand-red)] shadow-[0_6px_16px_-6px_rgba(226,31,29,0.6)]"
                    : "bg-white text-[var(--brand-black)]/70 border-black/5 hover:border-[var(--brand-red)]/40 hover:text-[var(--brand-black)]"
                )}
              >
                <Icon className={cn("size-3.5", active ? "text-white" : "text-[var(--brand-red)]")} />
                {c.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
