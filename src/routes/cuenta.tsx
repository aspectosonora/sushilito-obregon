import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { User, Award, History, LogIn, Gift, Sparkles, ShoppingBag, MapPin } from "lucide-react";
import { AppHeader } from "@/components/menu/AppHeader";
import { formatMXN } from "@/data/menu";
import {
  availablePoints,
  loadCustomerProfile,
  loadOrderHistory,
  saveCustomerProfile,
  statusLabel,
  type CustomerProfile,
  type SavedOrder,
} from "@/lib/orders";

export const Route = createFileRoute("/cuenta")({
  head: () => ({ meta: [{ title: "Historial y puntos - Sushilito Obregon" }] }),
  component: CuentaPage,
});

function CuentaPage() {
  const [profile, setProfile] = useState<CustomerProfile>(() => loadCustomerProfile());
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    setProfile(loadCustomerProfile());
    setOrders(loadOrderHistory());
    setPoints(Math.max(0, availablePoints()));
  }, []);

  const saveProfile = () => {
    saveCustomerProfile(profile);
    setProfile(loadCustomerProfile());
  };

  return (
    <div className="min-h-screen pb-20 bg-[var(--brand-bg)]">
      <AppHeader />
      <div className="mx-auto max-w-2xl px-4 pt-5 space-y-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--brand-red)] font-bold">
            Mi cuenta
          </div>
          <h1 className="font-display text-3xl tracking-wide">HISTORIAL Y PUNTOS</h1>
        </div>

        <div className="rounded-3xl bg-[var(--brand-black)] text-white p-5 relative overflow-hidden shadow-xl shadow-black/20">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-[var(--brand-red)]/40 blur-3xl" />
          <div className="absolute right-3 top-3 text-white/10 font-jp text-2xl">寿司</div>
          <div className="relative flex items-center gap-3">
            <div className="size-14 rounded-2xl bg-[var(--brand-red)] grid place-items-center shadow-lg shadow-[var(--brand-red)]/40">
              <User className="size-7" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                {profile.phone ? "Cliente registrado" : "Inicia sesión"}
              </div>
              <div className="font-bold text-lg">{profile.name || "Acumula puntos y recibe promociones"}</div>
              {profile.phone && <div className="text-xs text-white/60">{profile.phone}</div>}
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <button
              onClick={saveProfile}
              className="flex-1 bg-[var(--brand-red)] hover:bg-white hover:text-[var(--brand-red)] text-white font-bold uppercase tracking-wide text-xs py-3 rounded-xl transition inline-flex items-center justify-center gap-1.5"
            >
              <LogIn className="size-4" />
              Entrar
            </button>
            <button
              onClick={saveProfile}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wide text-xs py-3 rounded-xl transition"
            >
              Guardar datos
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card
            icon={<Award className="size-5 text-[var(--brand-gold)]" />}
            title="Puntos"
            value={`${points} pts`}
            sub="Minimo 35 para canjear"
          />
          <Card
            icon={<Gift className="size-5 text-[var(--brand-red)]" />}
            title="Pedidos"
            value={String(orders.length)}
            sub="Guardados en historial"
          />
        </div>

        <section className="bg-white border rounded-2xl p-4 shadow-sm">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field
              label="Nombre"
              value={profile.name}
              onChange={(v) => setProfile({ ...profile, name: v })}
            />
            <Field
              label="Telefono"
              value={profile.phone}
              onChange={(v) => setProfile({ ...profile, phone: v })}
            />
            <Field
              label="Direccion"
              value={profile.address}
              onChange={(v) => setProfile({ ...profile, address: v })}
            />
            <Field
              label="Colonia"
              value={profile.colony}
              onChange={(v) => setProfile({ ...profile, colony: v })}
            />
            <Field
              label="Referencia"
              value={profile.reference}
              onChange={(v) => setProfile({ ...profile, reference: v })}
              className="sm:col-span-2"
            />
            <label className="sm:col-span-2 flex items-start gap-3 rounded-xl border border-black/10 bg-[var(--brand-bg)] px-3 py-3 text-sm">
              <input
                type="checkbox"
                checked={profile.marketingOptIn}
                onChange={(event) =>
                  setProfile({ ...profile, marketingOptIn: event.target.checked })
                }
                className="mt-1 accent-[var(--brand-red)]"
              />
              <span>
                <span className="block font-bold text-[var(--brand-black)]">
                  Quiero recibir promociones
                </span>
                <span className="block text-xs text-muted-foreground">
                  Guardaremos tus datos para puntos, historial y promos de Sushilito.
                </span>
              </span>
            </label>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <History className="size-5 text-[var(--brand-red)]" />
            <h2 className="font-display text-2xl tracking-wide">HISTORIAL DE PEDIDOS</h2>
          </div>
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-8 text-center">
                <div className="size-16 mx-auto rounded-full bg-[var(--brand-red)]/10 grid place-items-center mb-3">
                  <ShoppingBag className="size-7 text-[var(--brand-red)]" />
                </div>
                <h3 className="font-bold">Aun no tienes pedidos</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Cuando hagas tu primer pedido aparecera aqui.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 mt-4 bg-[var(--brand-red)] hover:bg-[var(--brand-black)] text-white text-xs font-bold uppercase tracking-wide px-5 py-2.5 rounded-lg transition"
                >
                  <Sparkles className="size-3.5" /> Explorar menu
                </Link>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto divide-y">
                {orders.map((order) => (
                  <article key={order.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold">{order.folio}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleString("es-MX")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-xl text-[var(--brand-red)]">
                          {formatMXN(order.total)}
                        </div>
                        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {statusLabel(order.status)}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3 text-[var(--brand-red)]" /> Sucursal{" "}
                      {order.sucursal.name} - {order.items.length} productos - {order.pointsEarned}{" "}
                      pts
                    </div>
                    <a
                      href={order.ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex text-xs font-bold uppercase tracking-wide text-[var(--brand-red)] hover:text-[var(--brand-black)]"
                    >
                      Ver comanda
                    </a>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-black)]/70">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-black/10 bg-[var(--brand-bg)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-red)]/40"
      />
    </label>
  );
}

function Card({
  icon,
  title,
  value,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] font-bold text-muted-foreground">
        {icon}
        {title}
      </div>
      <div className="font-display text-3xl mt-2">{value}</div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}
