import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useStore } from "@/lib/store";
import { formatMXN } from "@/data/menu";
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function CartSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { cart, subtotal, updateQty, removeItem, clearCart, sucursal, itemCount } = useStore();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-[var(--brand-bg)]">
        <SheetHeader className="bg-[var(--brand-black)] text-white p-5 space-y-1">
          <SheetTitle className="font-display text-3xl tracking-wide text-white flex items-center gap-2">
            <ShoppingBag className="size-6 text-[var(--brand-red)]" />
            TU PEDIDO
          </SheetTitle>
          <SheetDescription className="text-white/70 text-xs flex items-center gap-1.5">
            <MapPin className="size-3 text-[var(--brand-red)]" /> Sucursal {sucursal.name} · {itemCount} {itemCount === 1 ? "producto" : "productos"}
          </SheetDescription>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 grid place-items-center p-8 text-center">
            <div>
              <div className="size-20 mx-auto rounded-full bg-white grid place-items-center mb-4 border-2 border-dashed border-[var(--brand-red)]/30">
                <ShoppingBag className="size-9 text-[var(--brand-red)]" />
              </div>
              <h3 className="font-bold text-lg">Tu pedido está vacío</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">Agrega rollos, entradas o bebidas desde el menú.</p>
              <button onClick={() => onOpenChange(false)} className="mt-5 bg-[var(--brand-red)] text-white text-sm font-bold uppercase tracking-wide px-5 py-2.5 rounded-lg hover:bg-[var(--brand-black)] transition">
                Explorar menú
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {cart.map(i => (
                <div key={i.lineId} className="flex gap-3 bg-white rounded-2xl p-2.5 border border-black/5 shadow-sm">
                  <img src={i.image} alt={i.name} className="size-16 rounded-xl object-cover bg-muted shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-sm leading-tight truncate">{i.name}</div>
                      <button onClick={() => removeItem(i.lineId)} aria-label="Quitar" className="text-muted-foreground hover:text-[var(--brand-red)] shrink-0">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    {i.extras.length > 0 && <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">+ {i.extras.map(e => e.label).join(", ")}</div>}
                    {i.notes && <div className="text-[11px] italic text-muted-foreground mt-0.5 line-clamp-1">"{i.notes}"</div>}
                    <div className="mt-1.5 flex items-center justify-between">
                      <div className="inline-flex items-center gap-1 bg-[var(--brand-bg)] rounded-full p-0.5 border">
                        <button onClick={() => updateQty(i.lineId, i.qty - 1)} className="size-6 grid place-items-center rounded-full bg-white hover:bg-[var(--brand-red)] hover:text-white transition"><Minus className="size-3" /></button>
                        <span className="w-6 text-center text-sm font-bold">{i.qty}</span>
                        <button onClick={() => updateQty(i.lineId, i.qty + 1)} className="size-6 grid place-items-center rounded-full bg-white hover:bg-[var(--brand-red)] hover:text-white transition"><Plus className="size-3" /></button>
                      </div>
                      <span className="font-bold text-sm">{formatMXN(i.unitPrice * i.qty)}</span>
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={clearCart} className="w-full text-xs text-muted-foreground hover:text-[var(--brand-red)] py-2 inline-flex items-center justify-center gap-1.5">
                <Trash2 className="size-3" /> Vaciar pedido
              </button>
            </div>

            <div className="border-t bg-white p-4 space-y-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{formatMXN(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-base">Total</span>
                <span className="font-display text-2xl text-[var(--brand-red)]">{formatMXN(subtotal)}</span>
              </div>
              <Link
                to="/checkout"
                onClick={() => onOpenChange(false)}
                className="w-full inline-flex items-center justify-center gap-2 bg-[var(--brand-red)] hover:bg-[var(--brand-black)] text-white font-bold uppercase tracking-wide py-3.5 rounded-xl transition"
              >
                <MessageCircle className="size-4" /> Continuar pedido
              </Link>
              <p className="text-[10px] text-center text-muted-foreground uppercase tracking-wider">
                Se envía directo a WhatsApp de {sucursal.name}
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
