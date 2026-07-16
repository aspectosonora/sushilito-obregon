import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { formatMXN } from "@/data/menu";
import {
  availablePoints,
  completeLocalOrder,
  createSavedOrder,
  loadCustomerProfile,
  openWhatsAppOrder,
  type CustomerProfile,
} from "@/lib/orders";
import { syncOrderToFirebase } from "@/lib/firebase/rest";
import {
  MessageCircle,
  ShoppingBag,
  MapPin,
  Truck,
  Store,
  Banknote,
  Building2,
  Trash2,
  Star,
} from "lucide-react";

export function OrderForm() {
  const { cart, subtotal, sucursal, itemCount, updateQty, clearCart } = useStore();
  const [form, setForm] = useState<CustomerProfile>(() => loadCustomerProfile());
  const [points, setPoints] = useState(0);
  const [redeemPoints, setRedeemPoints] = useState(false);

  useEffect(() => {
    setForm(loadCustomerProfile());
    setPoints(Math.max(0, availablePoints()));
  }, []);

  const pointsToRedeem = redeemPoints && points >= 35 ? Math.min(points, subtotal) : 0;
  const total = Math.max(0, subtotal - pointsToRedeem);
  const canSend =
    cart.length > 0 &&
    form.name.trim().length > 1 &&
    form.phone.replace(/\D/g, "").length >= 8 &&
    (form.deliveryMode === "recoger" ||
      (form.address.trim().length > 3 && form.colony.trim().length > 1));

  const setField = <K extends keyof CustomerProfile>(key: K, value: CustomerProfile[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const send = () => {
    if (!canSend) return;
    const customer = {
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      colony: form.colony.trim(),
      reference: form.reference.trim(),
      cashAmount: form.cashAmount.trim(),
      notes: form.notes.trim(),
    };
    const order = createSavedOrder({
      cart,
      sucursal,
      customer,
      subtotal,
      pointsRedeemed: pointsToRedeem,
    });

    // WhatsApp is the critical path. Everything else is best-effort.
    openWhatsAppOrder(order);

    try {
      completeLocalOrder(order);
      setPoints(Math.max(0, availablePoints()));
    } catch (error) {
      console.warn("Historial/perfil/puntos no bloquearon WhatsApp", error);
    }

    void syncOrderToFirebase(order).catch((error) => {
      console.warn("Firebase no bloqueo WhatsApp", error);
    });
  };

  return (
    <section
      id="pedido"
      className="mx-auto max-w-3xl px-4 mt-10 scroll-mt-24 grid md:grid-cols-2 gap-4"
    >
      {/* DATOS DE ENTREGA */}
      <div className="rounded-2xl bg-white border border-black/5 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="size-8 rounded-lg bg-[var(--brand-red)] grid place-items-center">
            <MapPin className="size-4 text-white" />
          </div>
          <h3 className="font-display text-2xl tracking-wide">DATOS DE ENTREGA</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Completa tus datos para el pedido</p>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-black)]/70">
              Nombre completo
            </label>
            <input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              maxLength={80}
              className="mt-1 w-full rounded-xl border border-black/10 bg-[var(--brand-bg)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-black)]/70">
              Telefono
            </label>
            <input
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              maxLength={15}
              inputMode="tel"
              className="mt-1 w-full rounded-xl border border-black/10 bg-[var(--brand-bg)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40"
              placeholder="644 000 0000"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-black)]/70">
              Entrega
            </label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setField("deliveryMode", "recoger")}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wide border-2 transition ${form.deliveryMode === "recoger" ? "bg-[var(--brand-red)] text-white border-[var(--brand-red)]" : "bg-white text-[var(--brand-black)] border-black/10"}`}
              >
                <Store className="size-3.5" /> Recoger
              </button>
              <button
                type="button"
                onClick={() => setField("deliveryMode", "domicilio")}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wide border-2 transition ${form.deliveryMode === "domicilio" ? "bg-[var(--brand-red)] text-white border-[var(--brand-red)]" : "bg-white text-[var(--brand-black)] border-black/10"}`}
              >
                <Truck className="size-3.5" /> Domicilio
              </button>
            </div>
          </div>

          {form.deliveryMode === "domicilio" && (
            <>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-black)]/70">
                  Direccion
                </label>
                <input
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                  maxLength={160}
                  className="mt-1 w-full rounded-xl border border-black/10 bg-[var(--brand-bg)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40"
                  placeholder="Calle y numero"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-black)]/70">
                  Colonia
                </label>
                <input
                  value={form.colony}
                  onChange={(e) => setField("colony", e.target.value)}
                  maxLength={90}
                  className="mt-1 w-full rounded-xl border border-black/10 bg-[var(--brand-bg)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40"
                  placeholder="Colonia"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-black)]/70">
                  Referencia
                </label>
                <input
                  value={form.reference}
                  onChange={(e) => setField("reference", e.target.value)}
                  maxLength={140}
                  className="mt-1 w-full rounded-xl border border-black/10 bg-[var(--brand-bg)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40"
                  placeholder="Color de casa, entre calles..."
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-black)]/70">
              Metodo de pago
            </label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setField("paymentMethod", "efectivo")}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wide border-2 transition ${form.paymentMethod === "efectivo" ? "bg-[var(--brand-black)] text-white border-[var(--brand-black)]" : "bg-white text-[var(--brand-black)] border-black/10"}`}
              >
                <Banknote className="size-3.5" /> Efectivo
              </button>
              <button
                type="button"
                onClick={() => setField("paymentMethod", "transferencia")}
                className={`inline-flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-bold uppercase tracking-wide border-2 transition ${form.paymentMethod === "transferencia" ? "bg-[var(--brand-black)] text-white border-[var(--brand-black)]" : "bg-white text-[var(--brand-black)] border-black/10"}`}
              >
                <Building2 className="size-3.5" /> Transferencia
              </button>
            </div>
          </div>

          {form.paymentMethod === "efectivo" && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-black)]/70">
                Con cuanto pagara?
              </label>
              <input
                value={form.cashAmount}
                onChange={(e) => setField("cashAmount", e.target.value)}
                inputMode="numeric"
                maxLength={8}
                className="mt-1 w-full rounded-xl border border-black/10 bg-[var(--brand-bg)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40"
                placeholder="$500"
              />
            </div>
          )}

          {points >= 35 && (
            <label className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-[var(--brand-bg)] px-3 py-2.5 cursor-pointer">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                <Star className="size-4 text-[var(--brand-gold)] fill-[var(--brand-gold)]" /> Usar{" "}
                {Math.min(points, subtotal)} puntos
              </span>
              <input
                type="checkbox"
                checked={redeemPoints}
                onChange={(event) => setRedeemPoints(event.target.checked)}
                className="size-4 accent-[var(--brand-red)]"
              />
            </label>
          )}

          <label className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-[var(--brand-bg)] px-3 py-2.5 cursor-pointer">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
              <Star className="size-4 text-[var(--brand-gold)] fill-[var(--brand-gold)]" />
              Acumular puntos y recibir promociones
            </span>
            <input
              type="checkbox"
              checked={form.marketingOptIn}
              onChange={(event) => setField("marketingOptIn", event.target.checked)}
              className="size-4 accent-[var(--brand-red)]"
            />
          </label>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-black)]/70">
              Notas
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              rows={2}
              maxLength={240}
              className="mt-1 w-full rounded-xl border border-black/10 bg-[var(--brand-bg)] px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40"
              placeholder="Alguna indicacion especial"
            />
          </div>
        </div>
      </div>

      {/* TU PEDIDO */}
      <div className="rounded-2xl bg-[var(--brand-black)] text-white p-5 shadow-lg flex flex-col">
        <div className="flex items-center gap-2 mb-1">
          <div className="size-8 rounded-lg bg-[var(--brand-red)] grid place-items-center">
            <ShoppingBag className="size-4 text-white" />
          </div>
          <h3 className="font-display text-2xl tracking-wide">TU PEDIDO</h3>
        </div>
        <p className="text-xs text-white/60 mb-4">
          {itemCount > 0
            ? `${itemCount} ${itemCount === 1 ? "producto" : "productos"} - Sucursal ${sucursal.name}`
            : "Resumen actual"}
        </p>

        {cart.length === 0 ? (
          <div className="flex-1 grid place-items-center text-center py-8">
            <div>
              <div className="size-14 mx-auto rounded-full bg-white/5 border border-dashed border-white/15 grid place-items-center mb-3">
                <ShoppingBag className="size-6 text-white/40" />
              </div>
              <p className="text-sm text-white/70">Aun no agregas productos.</p>
              <p className="text-xs text-white/40 mt-1">
                Elige una categoria arriba para comenzar.
              </p>
            </div>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-2 max-h-72 overflow-y-auto pr-1">
              {cart.map((i) => (
                <li key={i.lineId} className="flex items-center gap-2 bg-white/5 rounded-xl p-2">
                  <img src={i.image} alt="" className="size-10 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {i.qty}x {i.name}
                    </div>
                    <div className="text-[11px] text-white/55">
                      {formatMXN(i.unitPrice * i.qty)}
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-1 bg-white/10 rounded-full p-0.5">
                    <button
                      onClick={() => updateQty(i.lineId, i.qty - 1)}
                      className="size-6 grid place-items-center rounded-full bg-white/10 hover:bg-[var(--brand-red)] text-xs"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-bold">{i.qty}</span>
                    <button
                      onClick={() => updateQty(i.lineId, i.qty + 1)}
                      className="size-6 grid place-items-center rounded-full bg-white/10 hover:bg-[var(--brand-red)] text-xs"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={clearCart}
              className="mt-2 self-start text-[11px] text-white/50 hover:text-[var(--brand-red)] inline-flex items-center gap-1"
            >
              <Trash2 className="size-3" /> Vaciar pedido
            </button>
          </>
        )}

        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="space-y-1 mb-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-white/60">Subtotal</span>
              <span className="font-semibold">{formatMXN(subtotal)}</span>
            </div>
            {pointsToRedeem > 0 && (
              <div className="flex items-center justify-between text-[var(--brand-gold)]">
                <span className="text-xs uppercase tracking-wider">Puntos</span>
                <span className="font-semibold">-{formatMXN(pointsToRedeem)}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs uppercase tracking-wider text-white/60">Total</span>
              <span className="font-display text-3xl text-white">{formatMXN(total)}</span>
            </div>
          </div>
          <button
            onClick={send}
            disabled={!canSend}
            className="w-full inline-flex items-center justify-center gap-2 bg-[var(--brand-red)] hover:bg-white hover:text-[var(--brand-red)] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold uppercase tracking-wide py-3.5 rounded-xl transition"
          >
            <MessageCircle className="size-4" />{" "}
            {cart.length === 0 ? "Comenzar pedido" : "Enviar por WhatsApp"}
          </button>
          <p className="text-[10px] text-center text-white/40 uppercase tracking-wider mt-2">
            Se envia directo al WhatsApp de {sucursal.name}
          </p>
        </div>
      </div>
    </section>
  );
}
