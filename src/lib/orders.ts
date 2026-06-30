import type { Sucursal } from "@/data/menu";
import { formatMXN } from "@/data/menu";
import type { CartItem } from "@/lib/store";

export type DeliveryMode = "domicilio" | "recoger";
export type PaymentMethod = "efectivo" | "transferencia";
export type OrderStatus = "recibido" | "preparando" | "en_camino" | "entregado" | "cancelado";

export type CustomerProfile = {
  name: string;
  phone: string;
  deliveryMode: DeliveryMode;
  address: string;
  colony: string;
  reference: string;
  paymentMethod: PaymentMethod;
  cashAmount: string;
  notes: string;
};

export type SavedOrder = {
  id: string;
  folio: string;
  createdAt: string;
  updatedAt: string;
  sucursal: Sucursal;
  customer: CustomerProfile;
  items: CartItem[];
  subtotal: number;
  promoSubtotal: number;
  eligibleSubtotal: number;
  shipping: number;
  pointsRedeemed: number;
  pointsEarned: number;
  total: number;
  status: OrderStatus;
  ticketUrl: string;
  expiresAt: string;
  expiresAtMillis: number;
};

export type PointsMovement = {
  id: string;
  orderId: string;
  createdAt: string;
  expiresAt?: string;
  expiresAtMillis?: number;
  points: number;
  type: "pedido" | "canje" | "ajuste";
};

export const EMPTY_CUSTOMER: CustomerProfile = {
  name: "",
  phone: "",
  deliveryMode: "recoger",
  address: "",
  colony: "",
  reference: "",
  paymentMethod: "efectivo",
  cashAmount: "",
  notes: "",
};

const LS_CUSTOMER = "sushilito.customer";
const LS_HISTORY = "sushilito.order_history";
const LS_POINTS = "sushilito.points_movements";
const LS_PENDING = "sushilito.firebase_pending_orders";

const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (error) {
    console.warn(`No se pudo leer ${key}`, error);
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`No se pudo guardar ${key}`, error);
  }
}

export function loadCustomerProfile(): CustomerProfile {
  return { ...EMPTY_CUSTOMER, ...readJson<Partial<CustomerProfile>>(LS_CUSTOMER, {}) };
}

export function saveCustomerProfile(customer: CustomerProfile) {
  writeJson(LS_CUSTOMER, customer);
}

export function loadOrderHistory(): SavedOrder[] {
  return readJson<SavedOrder[]>(LS_HISTORY, []);
}

export function saveOrderHistory(orders: SavedOrder[]) {
  writeJson(LS_HISTORY, orders.slice(0, 30));
}

export function saveLocalOrder(order: SavedOrder) {
  const history = loadOrderHistory();
  saveOrderHistory([order, ...history.filter((saved) => saved.id !== order.id)]);
}

export function updateLocalOrderStatus(orderId: string, status: OrderStatus) {
  const updatedAt = new Date().toISOString();
  saveOrderHistory(
    loadOrderHistory().map((order) =>
      order.id === orderId ? { ...order, status, updatedAt } : order,
    ),
  );
}

export function findLocalOrder(orderId: string): SavedOrder | null {
  return loadOrderHistory().find((order) => order.id === orderId) ?? null;
}

export function loadPointsMovements(): PointsMovement[] {
  return readJson<PointsMovement[]>(LS_POINTS, []);
}

export function savePointsMovements(movements: PointsMovement[]) {
  writeJson(LS_POINTS, movements.slice(0, 200));
}

export function availablePoints(now = Date.now()) {
  return loadPointsMovements().reduce((sum, movement) => {
    if (movement.points > 0 && movement.expiresAtMillis && movement.expiresAtMillis <= now)
      return sum;
    return sum + movement.points;
  }, 0);
}

export function savePendingFirebaseOrder(order: SavedOrder) {
  const pending = readJson<SavedOrder[]>(LS_PENDING, []);
  writeJson(LS_PENDING, [order, ...pending.filter((saved) => saved.id !== order.id)].slice(0, 30));
}

export function loadPendingFirebaseOrders(): SavedOrder[] {
  return readJson<SavedOrder[]>(LS_PENDING, []);
}

export function clearPendingFirebaseOrder(orderId: string) {
  writeJson(
    LS_PENDING,
    loadPendingFirebaseOrders().filter((order) => order.id !== orderId),
  );
}

function makeId(prefix: string) {
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${date}-${suffix}`;
}

export function createOrderId() {
  return makeId("SO");
}

export function createComandaUrl(orderId: string) {
  if (typeof window === "undefined") return `/comanda.html?id=${encodeURIComponent(orderId)}`;
  const url = new URL("/comanda.html", window.location.origin);
  url.searchParams.set("id", orderId);
  if (firebaseProjectId) url.searchParams.set("projectId", firebaseProjectId);
  if (firebaseApiKey) url.searchParams.set("apiKey", firebaseApiKey);
  return url.toString();
}

export function pointsForEligibleSubtotal(eligibleSubtotal: number) {
  return Math.floor(eligibleSubtotal / 10);
}

export function createSavedOrder(args: {
  cart: CartItem[];
  sucursal: Sucursal;
  customer: CustomerProfile;
  subtotal: number;
  pointsRedeemed?: number;
}): SavedOrder {
  const now = new Date();
  const id = createOrderId();
  const expiresAtMillis = now.getTime() + 48 * 60 * 60 * 1000;
  const promoSubtotal = args.cart
    .filter((item) => item.isPromotion)
    .reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const eligibleSubtotal = Math.max(0, args.subtotal - promoSubtotal);
  const pointsRedeemed = Math.max(0, Math.min(args.pointsRedeemed ?? 0, args.subtotal));
  const total = Math.max(0, args.subtotal - pointsRedeemed);

  return {
    id,
    folio: id,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    sucursal: args.sucursal,
    customer: args.customer,
    items: args.cart,
    subtotal: args.subtotal,
    promoSubtotal,
    eligibleSubtotal,
    shipping: 0,
    pointsRedeemed,
    pointsEarned: pointsForEligibleSubtotal(eligibleSubtotal),
    total,
    status: "recibido",
    ticketUrl: createComandaUrl(id),
    expiresAt: new Date(expiresAtMillis).toISOString(),
    expiresAtMillis,
  };
}

export function completeLocalOrder(order: SavedOrder) {
  try {
    saveCustomerProfile(order.customer);
  } catch (error) {
    console.warn("Perfil local no guardado", error);
  }

  try {
    saveLocalOrder(order);
  } catch (error) {
    console.warn("Historial local no guardado", error);
  }

  try {
    const movements = loadPointsMovements();
    const next: PointsMovement[] = [...movements];
    if (order.pointsEarned > 0) {
      const expiresAtMillis = Date.now() + 183 * 24 * 60 * 60 * 1000;
      next.unshift({
        id: `${order.id}-earn`,
        orderId: order.id,
        createdAt: order.createdAt,
        expiresAt: new Date(expiresAtMillis).toISOString(),
        expiresAtMillis,
        points: order.pointsEarned,
        type: "pedido",
      });
    }
    if (order.pointsRedeemed > 0) {
      next.unshift({
        id: `${order.id}-redeem`,
        orderId: order.id,
        createdAt: order.createdAt,
        points: -order.pointsRedeemed,
        type: "canje",
      });
    }
    savePointsMovements(next);
  } catch (error) {
    console.warn("Puntos locales no guardados", error);
  }
}

export function buildWhatsAppMessage(order: SavedOrder) {
  const lines: string[] = [];
  lines.push(`*Nuevo pedido Sushilito ${order.sucursal.name}*`);
  lines.push(`*Folio:* ${order.folio}`);
  lines.push("");
  lines.push("*Productos:*");
  order.items.forEach((item) => {
    lines.push(`- ${item.qty}x ${item.name} - ${formatMXN(item.unitPrice * item.qty)}`);
    if (item.extras.length)
      lines.push(`   Extras: ${item.extras.map((extra) => extra.label).join(", ")}`);
    if (item.notes) lines.push(`   Nota: ${item.notes}`);
  });
  lines.push("");
  lines.push(`*Subtotal:* ${formatMXN(order.subtotal)}`);
  if (order.pointsRedeemed > 0)
    lines.push(`*Puntos canjeados:* -${formatMXN(order.pointsRedeemed)}`);
  lines.push(`*Total:* ${formatMXN(order.total)}`);
  lines.push("");
  lines.push(`*Cliente:* ${order.customer.name}`);
  lines.push(`*Telefono:* ${order.customer.phone}`);
  lines.push(
    `*Entrega:* ${order.customer.deliveryMode === "domicilio" ? "Domicilio" : "Recoger en sucursal"}`,
  );
  if (order.customer.deliveryMode === "domicilio") {
    lines.push(`*Direccion:* ${order.customer.address}`);
    lines.push(`*Colonia:* ${order.customer.colony}`);
    if (order.customer.reference) lines.push(`*Referencia:* ${order.customer.reference}`);
  }
  lines.push(
    `*Pago:* ${order.customer.paymentMethod === "efectivo" ? "Efectivo" : "Transferencia"}`,
  );
  if (order.customer.paymentMethod === "efectivo" && order.customer.cashAmount) {
    lines.push(`*Paga con:* ${order.customer.cashAmount}`);
  }
  if (order.customer.notes) lines.push(`*Notas:* ${order.customer.notes}`);
  lines.push("");
  lines.push(`*Comanda:* ${order.ticketUrl}`);
  lines.push(`*Puntos generados:* ${order.pointsEarned}`);
  return lines.join("\n");
}

export function openWhatsAppOrder(order: SavedOrder) {
  const phone = order.sucursal.whatsapp.replace(/\D/g, "");
  const message = buildWhatsAppMessage(order);
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) window.location.href = url;
}

export const ORDER_STATUSES: { value: OrderStatus; label: string }[] = [
  { value: "recibido", label: "Recibido" },
  { value: "preparando", label: "Preparando" },
  { value: "en_camino", label: "En camino" },
  { value: "entregado", label: "Entregado" },
  { value: "cancelado", label: "Cancelado" },
];

export function statusLabel(status: OrderStatus) {
  return ORDER_STATUSES.find((item) => item.value === status)?.label ?? status;
}
