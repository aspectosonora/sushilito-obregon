import { useEffect, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import type { Product, ProductOption } from "@/data/menu";
import { formatMXN } from "@/data/menu";
import { useStore } from "@/lib/store";
import type { CartItem } from "@/lib/store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const proteinExtras = new Set([
  "camaron-empanizado-dentro", "extra-camaron", "extra-marlin", "extra-ostion",
  "extra-pollo", "extra-pulpo", "extra-res", "extra-salmon", "extra-surimi",
  "extra-tampico", "extra-tocino",
]);

const extraTabs = [
  { id: "proteinas", label: "Proteínas" },
  { id: "complementos", label: "Complementos" },
  { id: "preparacion", label: "Preparación" },
] as const;

function extraCategory(id: string) {
  if (id === "alga-por-fuera") return "preparacion";
  return proteinExtras.has(id) ? "proteinas" : "complementos";
}

export function ProductModal({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { addItem } = useStore();
  const [qty, setQty] = useState(1);
  const [extras, setExtras] = useState<CartItem["extras"]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, ProductOption>>({});
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (product) { setQty(1); setExtras([]); setSelectedOptions({}); setNotes(""); }
  }, [product?.id]);

  if (!product) return null;

  const availableExtraTabs = extraTabs
    .map((tab) => ({ ...tab, options: product.extras?.filter((extra) => extraCategory(extra.id) === tab.id) ?? [] }))
    .filter((tab) => tab.options.length > 0);

  const optionEntries: CartItem["extras"] = Object.entries(selectedOptions).map(([groupId, option]) => {
    const group = product.optionGroups?.find((item) => item.id === groupId);
    return {
      id: `${groupId}:${option.id}`,
      label: group ? `${group.title}: ${option.label}` : option.label,
      priceDelta: option.priceDelta,
    };
  });
  const extrasTotal = [...extras, ...optionEntries].reduce(
    (sum, extra) => sum + extra.priceDelta * (extra.qty ?? 1), 0,
  );
  const total = (product.price + extrasTotal) * qty;
  const missingRequired = product.optionGroups?.some((group) => group.required && !selectedOptions[group.id]);

  const changeExtraQty = (id: string, delta: number) => {
    const opt = product.extras?.find(e => e.id === id);
    if (!opt) return;
    setExtras((current) => {
      const existing = current.find((extra) => extra.id === id);
      const nextQty = Math.max(0, (existing?.qty ?? 0) + delta);
      if (nextQty === 0) return current.filter((extra) => extra.id !== id);
      if (existing) return current.map((extra) => extra.id === id ? { ...extra, qty: nextQty } : extra);
      return [...current, { id: opt.id, label: opt.label, priceDelta: opt.priceDelta, qty: nextQty }];
    });
  };

  const handleAdd = () => {
    if (missingRequired) return;
    addItem(product, qty, [...optionEntries, ...extras], notes.trim() || undefined);
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

          {product.optionGroups && product.optionGroups.length > 0 && (
            <div className="mt-5 space-y-4">
              {product.optionGroups.map((group) => (
                <div key={group.id}>
                  <div className="text-sm font-semibold mb-2">
                    {group.title}
                    {group.required && <span className="text-[var(--brand-red)]"> *</span>}
                  </div>
                  {group.options.length > 12 ? (
                    <select
                      value={selectedOptions[group.id]?.id ?? ""}
                      onChange={(event) => {
                        const option = group.options.find((entry) => entry.id === event.target.value);
                        setSelectedOptions((current) => {
                          const next = { ...current };
                          if (option) next[group.id] = option;
                          else delete next[group.id];
                          return next;
                        });
                      }}
                      className="w-full rounded-xl border border-border bg-background p-3 text-sm"
                    >
                      <option value="">Selecciona un rollo</option>
                      {group.options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                    </select>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {group.options.map((option) => {
                        const checked = selectedOptions[group.id]?.id === option.id;
                        return (
                          <label
                            key={option.id}
                            className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition ${checked ? "border-[var(--brand-red)] bg-[var(--brand-red)]/5" : "border-border hover:border-[var(--brand-black)]/40"}`}
                          >
                            <input
                              type="radio"
                              name={group.id}
                              checked={checked}
                              onChange={() =>
                                setSelectedOptions((current) => ({ ...current, [group.id]: option }))
                              }
                              className="size-4 accent-[var(--brand-red)]"
                            />
                            <span className="text-sm leading-tight">{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {product.extras && product.extras.length > 0 && (
            <div className="mt-5">
              <div className="text-sm font-semibold mb-1">Extras</div>
              <Tabs key={product.id} defaultValue={availableExtraTabs[0]?.id}>
                <TabsList className="w-full h-auto justify-start overflow-x-auto">
                  {availableExtraTabs.map((tab) => (
                    <TabsTrigger key={tab.id} value={tab.id} className="shrink-0 px-2 text-xs">
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {availableExtraTabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="space-y-1.5">
                    {tab.options.map((ex) => {
                      const count = extras.find((extra) => extra.id === ex.id)?.qty ?? 0;
                      return (
                        <div key={ex.id} className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-border">
                          <div className="min-w-0">
                            <div className="text-sm leading-tight">{ex.label}</div>
                            <div className="text-xs font-semibold text-[var(--brand-red)]">+{formatMXN(ex.priceDelta)} c/u</div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <button type="button" onClick={() => changeExtraQty(ex.id, -1)} disabled={count === 0}
                              aria-label={`Quitar ${ex.label}`} className="size-8 grid place-items-center rounded-full border disabled:opacity-30">
                              <Minus className="size-4" />
                            </button>
                            <span className="w-6 text-center text-sm font-semibold">{count}</span>
                            <button type="button" onClick={() => changeExtraQty(ex.id, 1)}
                              aria-label={`Agregar ${ex.label}`} className="size-8 grid place-items-center rounded-full border">
                              <Plus className="size-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>
                ))}
              </Tabs>
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
            disabled={missingRequired}
            className="flex-1 inline-flex items-center justify-between bg-[var(--brand-red)] hover:bg-[var(--brand-black)] disabled:opacity-45 disabled:cursor-not-allowed text-white font-semibold px-4 py-3 rounded-xl transition"
          >
            <span>{missingRequired ? "Elige opciones" : "Agregar al pedido"}</span>
            <span>{formatMXN(total)}</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
