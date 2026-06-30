import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import type { Product } from "@/data/menu";
import { formatMXN } from "@/data/menu";
import { useStore } from "@/lib/store";
import type { CartItem } from "@/lib/store";

export function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { addItem } = useStore();
  const [qty, setQty] = useState(1);
  const [extras, setExtras] = useState<CartItem["extras"]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (product) { setQty(1); setExtras([]); setNotes(""); }
  }, [product?.id]);

  if (!product) return null;

  const extrasTotal = extras.reduce((a, e) => a + e.priceDelta, 0);
  const total = (product.price + extrasTotal) * qty;

  const toggleExtra = (id: string) => {
    const opt = product.extras?.find(e => e.id === id);
    if (!opt) return;
    setExtras(prev => prev.find(e => e.id === id)
      ? prev.filter(e => e.id !== id)
      : [...prev, { id: opt.id, label: opt.label, priceDelta: opt.priceDelta }]);
  };

  const handleAdd = () => {
    addItem(product, qty, extras, notes.trim() || undefined);
    onClose();
  };

  return (
    <Dialog open={!!product} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="p-0 max-w-md gap-0 overflow-hidden max-h-[92vh] flex flex-col">
        <div className="relative h-56 shrink-0 bg-muted">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <button onClick={onClose} className="absolute top-3 right-3 size-9 grid place-items-center rounded-full bg-white/95 shadow">
            <X className="size-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          <DialogTitle className="text-xl font-bold">{product.name}</DialogTitle>
          <DialogDescription className="text-sm mt-1">{product.description}</DialogDescription>
          <div className="mt-2 text-lg font-bold text-[var(--brand-red)]">{formatMXN(product.price)}</div>

          {product.extras && product.extras.length > 0 && (
            <div className="mt-5">
              <div className="text-sm font-semibold mb-2">Extras</div>
              <div className="space-y-1.5">
                {product.extras.map(ex => {
                  const checked = !!extras.find(e => e.id === ex.id);
                  return (
                    <label key={ex.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border hover:border-[var(--brand-black)]/40 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleExtra(ex.id)}
                          className="size-4 accent-[var(--brand-red)]"
                        />
                        <span className="text-sm">{ex.label}</span>
                      </div>
                      <span className="text-sm font-semibold">+{formatMXN(ex.priceDelta)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-5">
            <label className="text-sm font-semibold">Notas especiales</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Ej. sin cebolla, salsa aparte..."
              rows={2}
              className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/30"
            />
          </div>
        </div>

        <div className="p-4 border-t bg-background flex items-center gap-3">
          <div className="flex items-center gap-2 bg-muted rounded-full p-1">
            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="size-8 grid place-items-center rounded-full bg-white shadow-sm">
              <Minus className="size-4" />
            </button>
            <span className="w-6 text-center font-bold">{qty}</span>
            <button onClick={() => setQty(q => q + 1)} className="size-8 grid place-items-center rounded-full bg-white shadow-sm">
              <Plus className="size-4" />
            </button>
          </div>
          <button
            onClick={handleAdd}
            className="flex-1 inline-flex items-center justify-between bg-[var(--brand-red)] hover:bg-[var(--brand-black)] text-white font-semibold px-4 py-3 rounded-xl transition"
          >
            <span>Agregar al pedido</span>
            <span>{formatMXN(total)}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
