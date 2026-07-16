import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  Award,
  Gift,
  History,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  ShoppingBag,
  Sparkles,
  User,
} from "lucide-react";
import { AppHeader } from "@/components/menu/AppHeader";
import { formatMXN } from "@/data/menu";
import {
  availablePoints,
  loadCustomerProfile,
  loadOrderHistory,
  loadPointsMovements,
  pointsBalance,
  saveCustomerProfile,
  statusLabel,
  type CustomerProfile,
  type PointsMovement,
  type SavedOrder,
} from "@/lib/orders";
import {
  loadCustomerProfileFromFirebase,
  loadOrdersForCustomerFromFirebase,
  loadPointsForCustomerFromFirebase,
  saveCustomerProfileToFirebase,
} from "@/lib/firebase/rest";
import {
  firebaseAuthReady,
  handleAuthRedirect,
  profileFromAuthUser,
  signInSocial,
  signOutSocial,
  watchAuth,
  type SocialProvider,
} from "@/lib/firebase/auth";

export const Route = createFileRoute("/cuenta")({
  head: () => ({ meta: [{ title: "Historial y puntos - Sushilito Obregon" }] }),
  component: CuentaPage,
});

function CuentaPage() {
  const [profile, setProfile] = useState<CustomerProfile>(() => loadCustomerProfile());
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [points, setPoints] = useState(0);
  const [authEmail, setAuthEmail] = useState("");

  const refreshFromFirebase = async (baseProfile: CustomerProfile) => {
    const remoteProfile = await loadCustomerProfileFromFirebase(baseProfile).catch((error) => {
      console.warn("Perfil Firebase no bloqueo cuenta", error);
      return null;
    });
    const mergedProfile = remoteProfile ? mergeProfile(baseProfile, remoteProfile) : baseProfile;
    if (remoteProfile) {
      saveCustomerProfile(mergedProfile);
      setProfile(mergedProfile);
    }

    const [remoteOrders, remotePoints] = await Promise.all([
      loadOrdersForCustomerFromFirebase(mergedProfile).catch((error) => {
        console.warn("Historial Firebase no bloqueo cuenta", error);
        return [];
      }),
      loadPointsForCustomerFromFirebase(mergedProfile).catch((error) => {
        console.warn("Puntos Firebase no bloqueo cuenta", error);
        return [];
      }),
    ]);
    setOrders(mergeOrders(remoteOrders, loadOrderHistory()));
    setPoints(Math.max(0, pointsBalance(mergePoints(remotePoints, loadPointsMovements()))));
  };

  const applyAuthProfile = async (authProfile: Partial<CustomerProfile>) => {
    const nextProfile = mergeProfile(loadCustomerProfile(), authProfile);
    saveCustomerProfile(nextProfile);
    setProfile(nextProfile);
    await saveCustomerProfileToFirebase(nextProfile).catch((error) => {
      console.warn("Perfil social Firebase no bloqueo cuenta", error);
    });
    await refreshFromFirebase(nextProfile);
  };

  useEffect(() => {
    const localProfile = loadCustomerProfile();
    setProfile(localProfile);
    setOrders(loadOrderHistory());
    setPoints(Math.max(0, availablePoints()));
    void refreshFromFirebase(localProfile);

    let unsubscribe: (() => void) | undefined;
    if (firebaseAuthReady) {
      handleAuthRedirect()
        .then((user) => {
          if (user) void applyAuthProfile(profileFromAuthUser(user));
        })
        .catch((error) => console.warn("Redirect auth no bloqueo cuenta", error));
      void watchAuth((user) => {
        setAuthEmail(user?.email || "");
        if (user) void applyAuthProfile(profileFromAuthUser(user));
      })
        .then((unsub) => {
          unsubscribe = unsub;
        })
        .catch((error) => console.warn("Auth no disponible", error));
    }

    return () => unsubscribe?.();
  }, []);

  const saveProfile = () => {
    saveCustomerProfile(profile);
    setProfile(loadCustomerProfile());
    void saveCustomerProfileToFirebase(profile).catch((error) => {
      console.warn("Perfil Firebase no bloqueo cuenta", error);
    });
    void refreshFromFirebase(profile);
  };

  const login = (provider: SocialProvider) => {
    if (!firebaseAuthReady) return;
    void signInSocial(provider)
      .then((user) => {
        if (user) void applyAuthProfile(profileFromAuthUser(user));
      })
      .catch((error) => console.warn("Login social no disponible", error));
  };

  const logout = () => {
    void signOutSocial().catch((error) => console.warn("Cerrar sesion no bloqueo cuenta", error));
    setAuthEmail("");
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
          <div className="absolute right-3 top-3 text-white/10 font-jp text-2xl">SUSHI</div>
          <div className="relative flex items-center gap-3">
            <div className="size-14 rounded-2xl bg-[var(--brand-red)] grid place-items-center shadow-lg shadow-[var(--brand-red)]/40">
              <User className="size-7" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                {profile.phone || authEmail ? "Cliente registrado" : "Inicia sesion"}
              </div>
              <div className="font-bold text-lg">
                {profile.name || "Acumula puntos y recibe promociones"}
              </div>
              {profile.phone && <div className="text-xs text-white/60">{profile.phone}</div>}
              {authEmail && <div className="text-xs text-white/60">{authEmail}</div>}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <SocialButton label="Google" onClick={() => login("google")} disabled={!firebaseAuthReady} />
            <SocialButton label="Apple" onClick={() => login("apple")} disabled={!firebaseAuthReady} />
            <SocialButton
              label="Outlook"
              icon={<Mail className="size-3.5" />}
              onClick={() => login("outlook")}
              disabled={!firebaseAuthReady}
            />
          </div>

          <div className="mt-2 flex gap-2">
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
            {authEmail && (
              <button
                onClick={logout}
                className="bg-white/10 hover:bg-white/20 text-white font-bold uppercase tracking-wide text-xs px-3 py-3 rounded-xl transition inline-flex items-center justify-center"
                aria-label="Cerrar sesion"
              >
                <LogOut className="size-4" />
              </button>
            )}
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
                      {order.sucursal?.name || "Sin sucursal"} - {order.items.length} productos -{" "}
                      {order.pointsEarned} pts
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

function mergeProfile(base: CustomerProfile, incoming: Partial<CustomerProfile>): CustomerProfile {
  return {
    ...base,
    ...Object.fromEntries(
      Object.entries(incoming).filter(([, value]) => value !== undefined && value !== ""),
    ),
  } as CustomerProfile;
}

function mergeOrders(remote: SavedOrder[], local: SavedOrder[]) {
  return [...remote, ...local.filter((item) => !remote.some((order) => order.id === item.id))].sort(
    (a, b) => String(b.createdAt).localeCompare(String(a.createdAt)),
  );
}

function mergePoints(
  remote: {
    id: string;
    pedidoId?: string;
    puntos?: number;
    tipo?: string;
    creadoEn?: string;
    expiresAtMillis?: number;
  }[],
  local: PointsMovement[],
) {
  const remoteMapped: PointsMovement[] = remote.map((point) => ({
    id: point.id,
    orderId: point.pedidoId || "",
    points: Number(point.puntos || 0),
    type: point.tipo === "canje" || point.tipo === "ajuste" ? point.tipo : "pedido",
    createdAt: point.creadoEn || "",
    expiresAtMillis: point.expiresAtMillis,
  }));
  return [
    ...remoteMapped,
    ...local.filter((point) => !remoteMapped.some((remotePoint) => remotePoint.id === point.id)),
  ];
}

function SocialButton({
  label,
  icon = <User className="size-3.5" />,
  disabled,
  onClick,
}: {
  label: string;
  icon?: ReactNode;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white font-bold uppercase tracking-wide text-[10px] py-2.5 rounded-xl transition inline-flex items-center justify-center gap-1.5"
    >
      {icon}
      {label}
    </button>
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
  icon: ReactNode;
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
