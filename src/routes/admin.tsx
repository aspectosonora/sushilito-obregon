import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Award,
  BarChart3,
  DollarSign,
  Lock,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Save,
  Settings,
  Tag,
  TrendingUp,
  UserCheck,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { categories, formatMXN, products } from "@/data/menu";
import {
  ORDER_STATUSES,
  availablePoints,
  loadCustomerProfile,
  loadOrderHistory,
  loadPointsMovements,
  saveOrderHistory,
  statusLabel,
  updateLocalOrderStatus,
  type OrderStatus,
  type PointsMovement,
  type SavedOrder,
} from "@/lib/orders";
import {
  firebaseConfigStatus,
  loadCustomersFromFirebase,
  loadOrdersFromFirebase,
  loadPointsFromFirebase,
  saveCategoryToFirebase,
  saveProductToFirebase,
  updateOrderStatus,
  type AdminCustomerRecord,
  type AdminPointsRecord,
} from "@/lib/firebase/rest";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin - Sushilito Obregon" }] }),
  component: AdminPage,
});

type AdminTab =
  | "resumen"
  | "pedidos"
  | "clientes"
  | "puntos"
  | "productos"
  | "categorias"
  | "configuracion";

type AdminCustomer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  colony: string;
  reference: string;
  deliveryMode: string;
  lastBranch: string;
  lastOrderId: string;
  subscribed: boolean;
  updatedAt: string;
  orderCount: number;
  totalSpent: number;
  points: number;
};

type AdminPoint = {
  id: string;
  customerId: string;
  orderId: string;
  points: number;
  type: string;
  createdAt: string;
  expiresAtMillis?: number;
};

const adminPin = (import.meta.env.VITE_ADMIN_PIN as string | undefined) || "2026";

function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [tab, setTab] = useState<AdminTab>("resumen");
  const [orders, setOrders] = useState<SavedOrder[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [points, setPoints] = useState<AdminPoint[]>([]);
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

  const metrics = useMemo(() => buildMetrics(orders, customers, points), [orders, customers, points]);

  const tiles = useMemo(
    () => [
      { id: "resumen" as const, icon: BarChart3, label: "Resumen", count: formatMXN(metrics.revenue) },
      { id: "pedidos" as const, icon: Package, label: "Pedidos", count: `${orders.length}` },
      { id: "clientes" as const, icon: Users, label: "Clientes", count: `${customers.length}` },
      { id: "puntos" as const, icon: Award, label: "Puntos", count: `${metrics.activePoints}` },
      { id: "productos" as const, icon: UtensilsCrossed, label: "Productos", count: `${products.length}` },
      { id: "categorias" as const, icon: Tag, label: "Categorias", count: `${categories.length}` },
      {
        id: "configuracion" as const,
        icon: Settings,
        label: "Config",
        count: firebaseConfigStatus.enabled ? "Firebase" : "Local",
      },
    ],
    [customers.length, metrics.activePoints, metrics.revenue, orders.length],
  );

  const refreshAdmin = async () => {
    setLoading(true);
    try {
      const [remoteOrders, remoteCustomers, remotePoints] = await Promise.all([
        loadOrdersFromFirebase().catch((error) => {
          console.warn("Pedidos Firebase no disponibles", error);
          return [];
        }),
        loadCustomersFromFirebase().catch((error) => {
          console.warn("Clientes Firebase no disponibles", error);
          return [];
        }),
        loadPointsFromFirebase().catch((error) => {
          console.warn("Puntos Firebase no disponibles", error);
          return [];
        }),
      ]);

      const localOrders = loadOrderHistory();
      const mergedOrders = mergeOrders(remoteOrders, localOrders);
      const mergedPoints = mergePoints(remotePoints, loadPointsMovements(), mergedOrders);
      const mergedCustomers = mergeCustomers(remoteCustomers, mergedOrders, mergedPoints);

      setOrders(mergedOrders);
      setPoints(mergedPoints);
      setCustomers(mergedCustomers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unlocked) void refreshAdmin();
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
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
          >
            <ArrowLeft className="size-4" />
            Salir del admin
          </Link>
          <button
            onClick={refreshAdmin}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-white/70 hover:text-white"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="font-display text-4xl">Sushilito Admin</h1>
        <p className="text-white/60 text-sm mt-1">
          Pedidos, clientes, puntos, estadisticas y configuracion operativa.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 mt-6">
          {tiles.map((t) => (
            <button
              key={t.label}
              onClick={() => setTab(t.id)}
              className={`text-left border rounded-2xl p-4 transition ${tab === t.id ? "bg-white text-black border-white" : "bg-white/5 hover:bg-white/10 border-white/10"}`}
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

        {tab === "resumen" && <SummaryPanel metrics={metrics} />}
        {tab === "pedidos" && (
          <OrdersPanel orders={orders} loading={loading} onChangeStatus={changeStatus} />
        )}
        {tab === "clientes" && <CustomersPanel customers={customers} />}
        {tab === "puntos" && <PointsPanel points={points} customers={customers} />}
        {tab === "productos" && (
          <ProductsPanel productDraft={productDraft} setProductDraft={setProductDraft} />
        )}
        {tab === "categorias" && (
          <CategoriesPanel categoryDraft={categoryDraft} setCategoryDraft={setCategoryDraft} />
        )}
        {tab === "configuracion" && <ConfigPanel />}
      </div>
    </div>
  );
}

function SummaryPanel({ metrics }: { metrics: ReturnType<typeof buildMetrics> }) {
  return (
    <section className="mt-8 space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard icon={<DollarSign />} label="Ventas" value={formatMXN(metrics.revenue)} />
        <MetricCard icon={<Package />} label="Pedidos" value={String(metrics.totalOrders)} />
        <MetricCard icon={<Users />} label="Clientes" value={String(metrics.totalCustomers)} />
        <MetricCard icon={<Award />} label="Puntos activos" value={`${metrics.activePoints} pts`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <AdminSection title="Estados de pedidos">
          <div className="space-y-2">
            {ORDER_STATUSES.map((status) => (
              <ProgressRow
                key={status.value}
                label={status.label}
                value={metrics.byStatus[status.value] ?? 0}
                max={Math.max(1, metrics.totalOrders)}
              />
            ))}
          </div>
        </AdminSection>

        <AdminSection title="Sucursales">
          <div className="space-y-2">
            {metrics.byBranch.map((branch) => (
              <ProgressRow
                key={branch.name}
                label={branch.name}
                value={branch.orders}
                max={Math.max(1, metrics.totalOrders)}
                detail={formatMXN(branch.revenue)}
              />
            ))}
          </div>
        </AdminSection>

        <AdminSection title="Top productos">
          <div className="space-y-3">
            {metrics.topProducts.length === 0 ? (
              <EmptyState>Aun no hay productos vendidos.</EmptyState>
            ) : (
              metrics.topProducts.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-white/80 truncate">{item.name}</span>
                  <span className="font-bold text-[var(--brand-gold)]">{item.qty} pz</span>
                </div>
              ))
            )}
          </div>
        </AdminSection>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <MetricCard icon={<TrendingUp />} label="Ticket promedio" value={formatMXN(metrics.avgTicket)} />
        <MetricCard icon={<UserCheck />} label="Suscritos" value={String(metrics.subscribed)} />
        <MetricCard icon={<Award />} label="Puntos emitidos" value={`${metrics.issuedPoints} pts`} />
      </div>
    </section>
  );
}

function OrdersPanel({
  orders,
  loading,
  onChangeStatus,
}: {
  orders: SavedOrder[];
  loading: boolean;
  onChangeStatus: (order: SavedOrder, status: OrderStatus) => void;
}) {
  return (
    <AdminSection title="Pedidos" className="mt-8">
      <div className="max-h-[620px] overflow-y-auto divide-y divide-white/10 pr-1">
        {orders.length === 0 ? (
          <EmptyState>{loading ? "Cargando pedidos..." : "Aun no hay pedidos guardados."}</EmptyState>
        ) : (
          orders.map((order) => (
            <article key={order.id} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-bold">{order.folio}</div>
                  <div className="text-xs text-white/50">
                    {new Date(order.createdAt).toLocaleString("es-MX")} - {order.sucursal.name}
                  </div>
                  <div className="text-xs text-white/70 mt-1">
                    {order.customer.name || "Sin nombre"} - {order.customer.phone || "Sin telefono"}
                  </div>
                  <div className="mt-2 text-xs text-white/50">
                    {order.customer.deliveryMode === "domicilio"
                      ? `${order.customer.address}, ${order.customer.colony}`
                      : "Recoger en sucursal"}{" "}
                    - Pago: {order.customer.paymentMethod}
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

              <div className="mt-3 rounded-xl bg-black/20 border border-white/10 p-3 text-xs text-white/70">
                {order.items.map((item) => (
                  <div key={item.lineId} className="flex justify-between gap-3">
                    <span>
                      {item.qty}x {item.name}
                      {item.notes ? ` - ${item.notes}` : ""}
                    </span>
                    <span>{formatMXN(item.unitPrice * item.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {ORDER_STATUSES.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => onChangeStatus(order, status.value)}
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
    </AdminSection>
  );
}

function CustomersPanel({ customers }: { customers: AdminCustomer[] }) {
  return (
    <AdminSection title="Clientes" className="mt-8">
      <div className="max-h-[620px] overflow-y-auto divide-y divide-white/10 pr-1">
        {customers.length === 0 ? (
          <EmptyState>Aun no hay clientes registrados o con pedido.</EmptyState>
        ) : (
          customers.map((customer) => (
            <article key={customer.id} className="py-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-bold">{customer.name || "Cliente sin nombre"}</div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="size-3 text-[var(--brand-red)]" />
                      {customer.phone || "Sin telefono"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3 text-[var(--brand-red)]" />
                      {customer.colony || customer.lastBranch || "Sin colonia"}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-white/50">
                    {customer.address || "Sin direccion"} {customer.reference ? `- ${customer.reference}` : ""}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <MiniStat label="Pedidos" value={String(customer.orderCount)} />
                  <MiniStat label="Total" value={formatMXN(customer.totalSpent)} />
                  <MiniStat label="Puntos" value={`${customer.points}`} />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-wide">
                <span className="rounded-full bg-white/10 px-2 py-1 text-white/60">
                  Entrega: {customer.deliveryMode || "sin dato"}
                </span>
                <span
                  className={`rounded-full px-2 py-1 ${customer.subscribed ? "bg-[var(--brand-red)] text-white" : "bg-white/10 text-white/50"}`}
                >
                  {customer.subscribed ? "Suscrito a promos" : "Sin suscripcion"}
                </span>
              </div>
            </article>
          ))
        )}
      </div>
    </AdminSection>
  );
}

function PointsPanel({
  points,
  customers,
}: {
  points: AdminPoint[];
  customers: AdminCustomer[];
}) {
  const customerById = new Map(customers.map((customer) => [customer.id, customer]));

  return (
    <AdminSection title="Puntos" className="mt-8">
      <div className="max-h-[620px] overflow-y-auto divide-y divide-white/10 pr-1">
        {points.length === 0 ? (
          <EmptyState>Aun no hay movimientos de puntos.</EmptyState>
        ) : (
          points.map((movement) => {
            const customer = customerById.get(movement.customerId);
            const expired =
              movement.points > 0 &&
              movement.expiresAtMillis &&
              movement.expiresAtMillis <= Date.now();
            return (
              <article key={movement.id} className="py-4 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold">
                    {customer?.name || movement.customerId || "Cliente no identificado"}
                  </div>
                  <div className="text-xs text-white/50">
                    {movement.orderId || "Sin pedido"} - {movement.type || "movimiento"} -{" "}
                    {movement.createdAt
                      ? new Date(movement.createdAt).toLocaleString("es-MX")
                      : "sin fecha"}
                  </div>
                  {expired && <div className="text-xs text-[var(--brand-red)] mt-1">Caducado</div>}
                </div>
                <div
                  className={`font-display text-2xl ${movement.points >= 0 ? "text-[var(--brand-gold)]" : "text-[var(--brand-red)]"}`}
                >
                  {movement.points >= 0 ? "+" : ""}
                  {movement.points}
                </div>
              </article>
            );
          })
        )}
      </div>
    </AdminSection>
  );
}

function ProductsPanel({
  productDraft,
  setProductDraft,
}: {
  productDraft: {
    id: string;
    name: string;
    categoryId: string;
    price: number;
    imageUrl: string;
    description: string;
  };
  setProductDraft: (draft: ProductsPanelProps) => void;
}) {
  return (
    <AdminSection title="Productos" className="mt-8">
      <div className="grid md:grid-cols-2 gap-3">
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
        onClick={() => void saveProductToFirebase({ ...productDraft, image: productDraft.imageUrl })}
        className="mt-4 inline-flex items-center gap-2 bg-[var(--brand-red)] hover:bg-white hover:text-[var(--brand-red)] text-white font-bold uppercase tracking-wide text-xs px-4 py-3 rounded-xl transition"
      >
        <Save className="size-4" />
        Guardar producto
      </button>
    </AdminSection>
  );
}

type ProductsPanelProps = {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  imageUrl: string;
  description: string;
};

function CategoriesPanel({
  categoryDraft,
  setCategoryDraft,
}: {
  categoryDraft: { id: string; name: string; tagline: string };
  setCategoryDraft: (draft: { id: string; name: string; tagline: string }) => void;
}) {
  return (
    <AdminSection title="Categorias" className="mt-8">
      <div className="grid md:grid-cols-3 gap-3">
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
    </AdminSection>
  );
}

function ConfigPanel() {
  return (
    <AdminSection title="Configuracion" className="mt-8">
      <ul className="space-y-1.5 text-sm text-white/70 list-disc list-inside">
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
        <li>Admin PIN: configurar VITE_ADMIN_PIN antes de produccion.</li>
        <li>Fotos: usar Foto URL por ahora; despues se conecta Storage/subida directa.</li>
      </ul>
    </AdminSection>
  );
}

function AdminSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-white/5 border border-white/10 rounded-2xl p-4 ${className}`}>
      <h2 className="font-display text-2xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="size-10 rounded-xl bg-[var(--brand-red)]/20 text-[var(--brand-red)] grid place-items-center">
        <span className="[&_svg]:size-5">{icon}</span>
      </div>
      <div className="mt-3 text-xs uppercase tracking-[0.2em] text-white/50">{label}</div>
      <div className="font-display text-3xl mt-1 text-white">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/10 px-3 py-2 min-w-[74px]">
      <div className="text-[9px] uppercase tracking-wider text-white/45">{label}</div>
      <div className="font-bold text-white">{value}</div>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  max,
  detail,
}: {
  label: string;
  value: number;
  max: number;
  detail?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-white/70">{label}</span>
        <span className="text-white/50">
          {value}
          {detail ? ` - ${detail}` : ""}
        </span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-[var(--brand-red)]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return <div className="py-10 text-center text-white/50 text-sm">{children}</div>;
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

function mergeOrders(remote: SavedOrder[], local: SavedOrder[]) {
  return [...remote, ...local.filter((item) => !remote.some((order) => order.id === item.id))].sort(
    (a, b) => String(b.createdAt).localeCompare(String(a.createdAt)),
  );
}

function mergePoints(
  remote: AdminPointsRecord[],
  local: PointsMovement[],
  orders: SavedOrder[],
): AdminPoint[] {
  const orderCustomer = new Map(
    orders.map((order) => [order.id, customerIdFromPhone(order.customer.phone, order.id)]),
  );
  const remotePoints = remote.map((point) => ({
    id: point.id,
    customerId: point.clienteId || orderCustomer.get(point.pedidoId || "") || "",
    orderId: point.pedidoId || "",
    points: Number(point.puntos || 0),
    type: point.tipo || "movimiento",
    createdAt: point.creadoEn || "",
    expiresAtMillis: point.expiresAtMillis,
  }));
  const localPoints = local.map((point) => ({
    id: point.id,
    customerId: orderCustomer.get(point.orderId) || "",
    orderId: point.orderId,
    points: point.points,
    type: point.type,
    createdAt: point.createdAt,
    expiresAtMillis: point.expiresAtMillis,
  }));
  return [
    ...remotePoints,
    ...localPoints.filter((point) => !remotePoints.some((remotePoint) => remotePoint.id === point.id)),
  ].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

function mergeCustomers(
  remote: AdminCustomerRecord[],
  orders: SavedOrder[],
  points: AdminPoint[],
): AdminCustomer[] {
  const map = new Map<string, AdminCustomer>();

  remote.forEach((customer) => {
    map.set(customer.id, {
      id: customer.id,
      name: customer.nombre || "",
      phone: customer.telefono || "",
      address: customer.direccion || "",
      colony: customer.colonia || "",
      reference: customer.referencia || "",
      deliveryMode: customer.formaEntrega || "",
      lastBranch: customer.ultimaSucursal || "",
      lastOrderId: customer.ultimoPedidoId || "",
      subscribed: Boolean(customer.suscritoPromociones),
      updatedAt: customer.actualizadoEn || "",
      orderCount: 0,
      totalSpent: 0,
      points: 0,
    });
  });

  orders.forEach((order) => {
    const id = customerIdFromPhone(order.customer.phone, order.id);
    const existing = map.get(id);
    map.set(id, {
      id,
      name: order.customer.name || existing?.name || "",
      phone: order.customer.phone || existing?.phone || "",
      address: order.customer.address || existing?.address || "",
      colony: order.customer.colony || existing?.colony || "",
      reference: order.customer.reference || existing?.reference || "",
      deliveryMode: order.customer.deliveryMode || existing?.deliveryMode || "",
      lastBranch: order.sucursal.name || existing?.lastBranch || "",
      lastOrderId: order.id,
      subscribed: Boolean(order.customer.marketingOptIn || existing?.subscribed),
      updatedAt: order.updatedAt || order.createdAt,
      orderCount: (existing?.orderCount || 0) + 1,
      totalSpent: (existing?.totalSpent || 0) + (order.status === "cancelado" ? 0 : order.total),
      points: existing?.points || 0,
    });
  });

  const profile = loadCustomerProfile();
  if (profile.phone) {
    const id = customerIdFromPhone(profile.phone, "local");
    const existing = map.get(id);
    map.set(id, {
      id,
      name: profile.name || existing?.name || "",
      phone: profile.phone || existing?.phone || "",
      address: profile.address || existing?.address || "",
      colony: profile.colony || existing?.colony || "",
      reference: profile.reference || existing?.reference || "",
      deliveryMode: profile.deliveryMode || existing?.deliveryMode || "",
      lastBranch: existing?.lastBranch || "",
      lastOrderId: existing?.lastOrderId || "",
      subscribed: Boolean(profile.marketingOptIn || existing?.subscribed),
      updatedAt: existing?.updatedAt || new Date().toISOString(),
      orderCount: existing?.orderCount || 0,
      totalSpent: existing?.totalSpent || 0,
      points: existing?.points || availablePoints(),
    });
  }

  const now = Date.now();
  points.forEach((point) => {
    const customer = map.get(point.customerId);
    if (!customer) return;
    if (point.points > 0 && point.expiresAtMillis && point.expiresAtMillis <= now) return;
    customer.points += point.points;
  });

  return Array.from(map.values()).sort(
    (a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)) || b.totalSpent - a.totalSpent,
  );
}

function buildMetrics(orders: SavedOrder[], customers: AdminCustomer[], points: AdminPoint[]) {
  const validOrders = orders.filter((order) => order.status !== "cancelado");
  const revenue = validOrders.reduce((sum, order) => sum + order.total, 0);
  const byStatus = ORDER_STATUSES.reduce(
    (acc, status) => ({ ...acc, [status.value]: 0 }),
    {} as Record<OrderStatus, number>,
  );
  orders.forEach((order) => {
    byStatus[order.status] = (byStatus[order.status] || 0) + 1;
  });

  const branchMap = new Map<string, { name: string; orders: number; revenue: number }>();
  validOrders.forEach((order) => {
    const current = branchMap.get(order.sucursal.name) || {
      name: order.sucursal.name,
      orders: 0,
      revenue: 0,
    };
    current.orders += 1;
    current.revenue += order.total;
    branchMap.set(order.sucursal.name, current);
  });

  const productMap = new Map<string, { name: string; qty: number }>();
  validOrders.forEach((order) => {
    order.items.forEach((item) => {
      const current = productMap.get(item.name) || { name: item.name, qty: 0 };
      current.qty += item.qty;
      productMap.set(item.name, current);
    });
  });

  const now = Date.now();
  const activePoints = points.reduce((sum, point) => {
    if (point.points > 0 && point.expiresAtMillis && point.expiresAtMillis <= now) return sum;
    return sum + point.points;
  }, 0);

  return {
    revenue,
    totalOrders: orders.length,
    totalCustomers: customers.length,
    activePoints: Math.max(0, activePoints),
    issuedPoints: points.filter((point) => point.points > 0).reduce((sum, point) => sum + point.points, 0),
    avgTicket: validOrders.length ? revenue / validOrders.length : 0,
    subscribed: customers.filter((customer) => customer.subscribed).length,
    byStatus,
    byBranch: Array.from(branchMap.values()).sort((a, b) => b.revenue - a.revenue),
    topProducts: Array.from(productMap.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 6),
  };
}

function customerIdFromPhone(phone: string, fallback: string) {
  const clean = phone.replace(/\D/g, "");
  return clean ? `tel-${clean}` : `anon-${fallback}`;
}
