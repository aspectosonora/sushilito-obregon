import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Package,
  UtensilsCrossed,
  Tag,
  Settings,
  ArrowLeft,
  Lock,
  RefreshCw,
  Save,
} from "lucide-react";
import { categories, products, formatMXN } from "@/data/menu";
import {
  ORDER_STATUSES,
  loadOrderHistory,
  saveOrderHistory,
  statusLabel,
  updateLocalOrderStatus,
  type OrderStatus,
  type SavedOrder,
} from "@/lib/orders";
import {
  firebaseConfigStatus,
  loadOrdersFromFirebase,
  saveCategoryToFirebase,
  saveProductToFirebase,
  updateOrderStatus,
} from "@/lib/firebase/rest";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin - Sushilito Obregon" }] }),
  component: AdminPage,
});

type AdminTab = "pedidos" | "productos" | "categorias" | "configuracion";

const adminPin = (import.meta.env.VITE_ADMIN_PIN as string | undefined) || "2026";

function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [tab, setTab] = useState<AdminTab>("pedidos");
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [productDraft, setProductDraft] = useState({
    id: products[0]?.id || "",
    name: products[0]?.name || "",
    categoryId: products[0]?.categoryId || "",
    price: products[0]?.price || 0,
    imageUrl: products[0]?.image || "",
    description: products[0]?.description || "",
  });
  const [categoryDraft, setCategoryDraft] = useState({
    id: categories[0]?.id || "",
    name: categories[0]?.name || "",
    tagline: categories[0]?.tagline || "",
  });

  const tiles = useMemo(
    () => [
      { id: "pedidos" as const, icon: Package, label: "Pedidos", count: `${orders.length}` },
      {
        id: "productos" as const,
        icon: UtensilsCrossed,
        label: "Productos",
        count: `${products.length}`,
      },
      { id: "categorias" as const, icon: Tag, label: "Categorias", count: `${categories.length}` },
      {
        id: "configuracion" as const,
        icon: Settings,
        label: "Config",
        count: firebaseConfigStatus.enabled ? "Firebase" : "Local",
      },
    ],
    [orders.length],
  );

  const refreshOrders = async () => {
    setLoading(true);
    try {
      const remote = await loadOrdersFromFirebase().catch((error) => {
        console.warn("Pedidos Firebase no disponibles", error);
        return [];
      });
      const local = loadOrderHistory();
      const merged = [
        ...remote,
        ...local.filter((item) => !remote.some((remoteOrder) => remoteOrder.id === item.id)),
      ].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
      setOrders(merged);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unlocked) void refreshOrders();
  }, [unlocked]);

  const changeStatus = (order: SavedOrder, status: OrderStatus) => {
    const updated = { ...order, status, updatedAt: new Date().toISOString() };
    setOrders((current) => current.map((item) => (item.id === order.id ? updated : item)));
    try {
      updateLocalOrderStatus(order.id, status);
      saveOrderHistory(loadOrderHistory().map((item) => (item.id === order.id ? updated : item)));
    } catch (error) {
      console.warn("Estado local no guardado", error);
    }
    void updateOrderStatus(order.id, status).catch((error) => {
      console.warn("Estado Firebase no bloqueo admin", error);
    });
  };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[var(--brand-black)] text-white grid place-items-center px-4">
        <div className="w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-6 shadow-xl">
          <div className="size-12 rounded-2xl bg-[var(--brand-red)] grid place-items-center mb-4">
            <Lock className="size-6" />
          </div>
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--brand-gold)]">
            Panel oculto
          </div>
          <h1 className="font-display text-4xl mt-1">Sushilito Admin</h1>
          <input
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            type="password"
            placeholder="PIN"
            className="mt-5 w-full rounded-xl bg-white text-black px-3 py-3 outline-none"
          />
          <button
            onClick={() => setUnlocked(pin === adminPin)}
            className="mt-3 w-full bg-[var(--brand-red)] hover:bg-white hover:text-[var(--brand-red)] text-white font-bold uppercase tracking-wide py-3 rounded-xl transition"
          >
            Entrar
          </button>
          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Salir
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--brand-black)] text-white">
      <header className="border-b border-white/10 sticky top-0 z-30 bg-[var(--brand-black)]/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Salir del admin
          </Link>
          <button
            onClick={refreshOrders}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-white/70 hover:text-white"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="font-display text-4xl">Sushilito Admin</h1>
        <p className="text-white/60 text-sm mt-1">Pedidos, estados, productos y categorias.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          {tiles.map((t) => (
            <button
              key={t.label}
              onClick={() => setTab(t.id)}
              className={`text-left border rounded-2xl p-5 transition ${tab === t.id ? "bg-white text-black border-white" : "bg-white/5 hover:bg-white/10 border-white/10"}`}
            >
              <div
                className={`size-10 rounded-xl grid place-items-center ${tab === t.id ? "bg-[var(--brand-red)] text-white" : "bg-[var(--brand-red)]/20 text-[var(--brand-red)]"}`}
              >
                <t.icon className="size-5" />
              </div>
              <div className="mt-3 font-semibold">{t.label}</div>
              <div className={tab === t.id ? "text-xs text-black/60" : "text-xs text-white/50"}>
                {t.count}
              </div>
            </button>
          ))}
        </div>

        {tab === "pedidos" && (
          <section className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-4">
            <h2 className="font-display text-2xl">Pedidos</h2>
            <div className="mt-4 max-h-[560px] overflow-y-auto divide-y divide-white/10">
              {orders.length === 0 ? (
                <div className="py-10 text-center text-white/50">Aun no hay pedidos guardados.</div>
              ) : (
                orders.map((order) => (
                  <article key={order.id} className="py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-bold">{order.folio}</div>
                        <div className="text-xs text-white/50">
                          {new Date(order.createdAt).toLocaleString("es-MX")} -{" "}
                          {order.sucursal.name}
                        </div>
                        <div className="text-xs text-white/60 mt-1">
                          {order.customer.name} - {order.customer.phone}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-display text-2xl text-[var(--brand-gold)]">
                          {formatMXN(order.total)}
                        </div>
                        <a
                          href={order.ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-white/60 hover:text-white"
                        >
                          Comanda
                        </a>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {ORDER_STATUSES.map((status) => (
                        <button
                          key={status.value}
                          onClick={() => changeStatus(order, status.value)}
                          className={`px-3 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide transition ${order.status === status.value ? "bg-[var(--brand-red)] text-white" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-white/45">
                      Tracking cliente: {statusLabel(order.status)}
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {tab === "productos" && (
          <section className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-4">
            <h2 className="font-display text-2xl">Productos</h2>
            <div className="mt-4 grid md:grid-cols-2 gap-3">
              <AdminInput
                label="ID"
                value={productDraft.id}
                onChange={(v) => setProductDraft({ ...productDraft, id: v })}
              />
              <AdminInput
                label="Nombre"
                value={productDraft.name}
                onChange={(v) => setProductDraft({ ...productDraft, name: v })}
              />
              <AdminInput
                label="Categoria"
                value={productDraft.categoryId}
                onChange={(v) => setProductDraft({ ...productDraft, categoryId: v })}
              />
              <AdminInput
                label="Precio"
                value={String(productDraft.price)}
                onChange={(v) => setProductDraft({ ...productDraft, price: Number(v) || 0 })}
              />
              <AdminInput
                label="Foto URL"
                value={productDraft.imageUrl}
                onChange={(v) => setProductDraft({ ...productDraft, imageUrl: v })}
                className="md:col-span-2"
              />
              <AdminInput
                label="Descripcion"
                value={productDraft.description}
                onChange={(v) => setProductDraft({ ...productDraft, description: v })}
                className="md:col-span-2"
              />
            </div>
            <button
              onClick={() =>
                void saveProductToFirebase({ ...productDraft, image: productDraft.imageUrl })
              }
              className="mt-4 inline-flex items-center gap-2 bg-[var(--brand-red)] hover:bg-white hover:text-[var(--brand-red)] text-white font-bold uppercase tracking-wide text-xs px-4 py-3 rounded-xl transition"
            >
              <Save className="size-4" />
              Guardar producto
            </button>
          </section>
        )}

        {tab === "categorias" && (
          <section className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-4">
            <h2 className="font-display text-2xl">Categorias</h2>
            <div className="mt-4 grid md:grid-cols-3 gap-3">
              <AdminInput
                label="ID"
                value={categoryDraft.id}
                onChange={(v) => setCategoryDraft({ ...categoryDraft, id: v })}
              />
              <AdminInput
                label="Nombre"
                value={categoryDraft.name}
                onChange={(v) => setCategoryDraft({ ...categoryDraft, name: v })}
              />
              <AdminInput
                label="Tagline"
                value={categoryDraft.tagline}
                onChange={(v) => setCategoryDraft({ ...categoryDraft, tagline: v })}
              />
            </div>
            <button
              onClick={() => void saveCategoryToFirebase(categoryDraft)}
              className="mt-4 inline-flex items-center gap-2 bg-[var(--brand-red)] hover:bg-white hover:text-[var(--brand-red)] text-white font-bold uppercase tracking-wide text-xs px-4 py-3 rounded-xl transition"
            >
              <Save className="size-4" />
              Guardar categoria
            </button>
          </section>
        )}

        {tab === "configuracion" && (
          <section className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="font-display text-2xl">Configuracion</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-white/70 list-disc list-inside">
              <li>
                Firestore:{" "}
                {firebaseConfigStatus.enabled
                  ? firebaseConfigStatus.projectId
                  : "pendiente VITE_FIREBASE_PROJECT_ID"}
              </li>
              <li>
                Colecciones esperadas: clientes, pedidos, comandas, puntos_movimientos, productos,
                categorias, configuracion.
              </li>
              <li>Fotos: usar Foto URL por ahora; despues se conecta Storage/subida directa.</li>
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function AdminInput({
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
      <span className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl bg-white text-black px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--brand-red)]"
      />
    </label>
  );
}
