import { Plus, Flame, Sparkles, Heart, Tag, Star, Check } from "lucide-react";
import type { Product, ProductTag } from "@/data/menu";
import { formatMXN } from "@/data/menu";
import { useStore } from "@/lib/store";

const tagStyles: Record<ProductTag, { label: string; icon: React.ReactNode; cls: string }> = {
  horneado: { label: "Horneado", icon: <Flame className="size-3" />, cls: "bg-[var(--brand-gold)]/20 text-[var(--brand-black)]" },
  picante: { label: "Picante", icon: <Flame className="size-3" />, cls: "bg-[var(--brand-red)] text-white" },
  favorito: { label: "Favorito", icon: <Heart className="size-3" />, cls: "bg-[var(--brand-black)] text-white" },
  promo: { label: "Promo", icon: <Tag className="size-3" />, cls: "bg-[var(--brand-gold)] text-[var(--brand-black)]" },
  nuevo: { label: "Nuevo", icon: <Sparkles className="size-3" />, cls: "bg-[var(--brand-red)]/10 text-[var(--brand-red)]" },
};

export function ProductCard({ product, onOpen }: { product: Product; onOpen: (p: Product) => void }) {
  const { cart } = useStore();
  const inCart = cart.filter(i => i.productId === product.id).reduce((a, i) => a + i.qty, 0);
  const added = inCart > 0;

  return (
    <button
      onClick={() => onOpen(product)}
      className={`group relative w-full text-left bg-white rounded-2xl overflow-hidden flex gap-3 p-3 transition active:scale-[0.99] shadow-sm hover:shadow-[0_10px_28px_-10px_rgba(226,31,29,0.35)] border-2 ${added ? "border-[var(--brand-red)]" : "border-transparent hover:border-[var(--brand-red)]/40"}`}
    >
      {added && (
        <span className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 bg-[var(--brand-red)] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow uppercase tracking-wider">
          <Check className="size-3" /> {inCart}
        </span>
      )}

      <div className="relative size-24 sm:size-28 shrink-0 overflow-hidden rounded-xl bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
        {product.tags?.includes("favorito") && (
          <div className="absolute top-1 left-1 size-6 rounded-full bg-[var(--brand-gold)] text-[var(--brand-black)] grid place-items-center shadow">
            <Star className="size-3.5 fill-current" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <h3 className="font-bold text-[15px] leading-tight pr-12 line-clamp-1">{product.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 min-h-[2rem]">{product.description}</p>

        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {product.tags.slice(0, 2).map(t => {
              const s = tagStyles[t];
              return (
                <span key={t} className={`chip-pill ${s.cls}`}>
                  {s.icon}{s.label}
                </span>
              );
            })}
          </div>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
          <span className="font-display text-xl text-[var(--brand-black)]">{formatMXN(product.price)}</span>
          <span className={`inline-flex items-center gap-1 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm transition ${added ? "bg-[var(--brand-black)]" : "bg-[var(--brand-red)] group-hover:bg-[var(--brand-black)]"}`}>
            <Plus className="size-3.5" />{added ? "Agregar más" : "Agregar"}
          </span>
        </div>
      </div>
    </button>
  );
}
