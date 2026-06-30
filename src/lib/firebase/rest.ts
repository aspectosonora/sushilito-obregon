import type { Category, Product } from "@/data/menu";
import type { OrderStatus, SavedOrder } from "@/lib/orders";
import { clearPendingFirebaseOrder, savePendingFirebaseOrder } from "@/lib/orders";

type FirestoreValue =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { timestampValue: string }
  | { stringValue: string }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { mapValue: { fields: Record<string, FirestoreValue> } };

export type FirebaseSyncResult =
  | { ok: true }
  | { ok: false; reason: "missing_config" | "request_failed"; error?: unknown };

export type AdminProduct = Product & {
  active?: boolean;
  order?: number;
  imageUrl?: string;
};

export type AdminCategory = Category & {
  active?: boolean;
  order?: number;
};

export type AdminCustomerRecord = {
  id: string;
  nombre?: string;
  telefono?: string;
  direccion?: string;
  colonia?: string;
  referencia?: string;
  formaEntrega?: string;
  ultimaSucursal?: string;
  ultimoPedidoId?: string;
  suscritoPromociones?: boolean;
  actualizadoEn?: string;
};

export type AdminPointsRecord = {
  id: string;
  clienteId?: string;
  pedidoId?: string;
  puntos?: number;
  tipo?: string;
  creadoEn?: string;
  expiresAtMillis?: number;
};

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;

export const firebaseConfigStatus = {
  enabled: Boolean(projectId),
  projectId: projectId || "",
};

function firestoreBaseUrl() {
  if (!projectId) return null;
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
}

function apiKeyQuery(prefix = "?") {
  return apiKey ? `${prefix}key=${encodeURIComponent(apiKey)}` : "";
}

function toFirestoreValue(value: unknown): FirestoreValue {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (typeof value === "string") {
    return /^\d{4}-\d{2}-\d{2}T/.test(value) ? { timestampValue: value } : { stringValue: value };
  }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFirestoreValue) } };
  if (typeof value === "object")
    return { mapValue: { fields: toFirestoreFields(value as Record<string, unknown>) } };
  return { stringValue: String(value) };
}

function toFirestoreFields(data: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, toFirestoreValue(value)]),
  );
}

function fromFirestoreValue(value: FirestoreValue): unknown {
  if ("nullValue" in value) return null;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("stringValue" in value) return value.stringValue;
  if ("arrayValue" in value) return (value.arrayValue.values ?? []).map(fromFirestoreValue);
  if ("mapValue" in value) return fromFirestoreFields(value.mapValue.fields ?? {});
  return null;
}

function fromFirestoreFields(fields: Record<string, FirestoreValue>) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, fromFirestoreValue(value)]),
  );
}

async function patchDocument(collection: string, id: string, data: Record<string, unknown>) {
  const baseUrl = firestoreBaseUrl();
  if (!baseUrl) throw new Error("Firebase project id is missing");
  const cleanId = encodeURIComponent(id.replace(/\//g, "-"));
  const res = await fetch(`${baseUrl}/${collection}/${cleanId}${apiKeyQuery()}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: toFirestoreFields(data) }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Firestore ${collection}/${id} failed: ${res.status} ${detail}`);
  }
}

async function safePatch(collection: string, id: string, data: Record<string, unknown>) {
  try {
    await patchDocument(collection, id, data);
    return true;
  } catch (error) {
    console.warn(`Firestore ${collection} fallo`, error);
    return false;
  }
}

async function getCollection(collection: string) {
  const baseUrl = firestoreBaseUrl();
  if (!baseUrl) return [];
  const res = await fetch(`${baseUrl}/${collection}${apiKeyQuery()}`);
  if (!res.ok) throw new Error(`Firestore read ${collection} failed: ${res.status}`);
  const json = (await res.json()) as {
    documents?: { name: string; fields: Record<string, FirestoreValue> }[];
  };
  return (json.documents ?? []).map((doc) => ({
    id: doc.name.split("/").pop() || "",
    data: fromFirestoreFields(doc.fields ?? {}),
  }));
}

function customerId(order: SavedOrder) {
  const phone = order.customer.phone.replace(/\D/g, "");
  return phone ? `tel-${phone}` : `anon-${order.id}`;
}

export async function syncOrderToFirebase(order: SavedOrder): Promise<FirebaseSyncResult> {
  if (!projectId) {
    savePendingFirebaseOrder(order);
    return { ok: false, reason: "missing_config" };
  }

  try {
    const cid = customerId(order);
    const now = new Date().toISOString();
    const results = await Promise.allSettled([
      safePatch("pedidos", order.id, { ...order, clienteId: cid, actualizadoEn: now }),
      safePatch("clientes", cid, {
        id: cid,
        nombre: order.customer.name,
        telefono: order.customer.phone,
        direccion: order.customer.address,
        colonia: order.customer.colony,
        referencia: order.customer.reference,
        formaEntrega: order.customer.deliveryMode,
        suscritoPromociones: Boolean(order.customer.marketingOptIn),
        ultimaSucursal: order.sucursal.id,
        ultimoPedidoId: order.id,
        actualizadoEn: now,
      }),
      safePatch("comandas", order.id, {
        id: order.id,
        pedidoId: order.id,
        folio: order.folio,
        sucursal: order.sucursal,
        cliente: order.customer,
        productos: order.items,
        subtotal: order.subtotal,
        total: order.total,
        estado: order.status,
        creadoEn: order.createdAt,
        actualizadoEn: now,
        expiresAt: order.expiresAt,
        expiresAtMillis: order.expiresAtMillis,
      }),
      order.pointsEarned > 0
        ? safePatch("puntos_movimientos", `${order.id}-earn`, {
            pedidoId: order.id,
            clienteId: cid,
            puntos: order.pointsEarned,
            tipo: "pedido",
            creadoEn: order.createdAt,
            expiresAtMillis: Date.now() + 183 * 24 * 60 * 60 * 1000,
          })
        : Promise.resolve(true),
      order.pointsRedeemed > 0
        ? safePatch("puntos_movimientos", `${order.id}-redeem`, {
            pedidoId: order.id,
            clienteId: cid,
            puntos: -order.pointsRedeemed,
            tipo: "canje",
            creadoEn: order.createdAt,
          })
        : Promise.resolve(true),
    ]);
    const ok = results.every((result) => result.status === "fulfilled" && result.value !== false);
    if (ok) clearPendingFirebaseOrder(order.id);
    else savePendingFirebaseOrder(order);
    return ok ? { ok: true } : { ok: false, reason: "request_failed" };
  } catch (error) {
    console.warn("Firebase no bloqueo el pedido", error);
    savePendingFirebaseOrder(order);
    return { ok: false, reason: "request_failed", error };
  }
}

export async function retryPendingFirebaseOrders(orders: SavedOrder[]) {
  if (!projectId) return;
  for (const order of orders) {
    await syncOrderToFirebase(order);
  }
}

export async function loadOrdersFromFirebase(): Promise<SavedOrder[]> {
  if (!projectId) return [];
  const docs = await getCollection("pedidos");
  return docs
    .map(({ data }) => data as unknown as SavedOrder)
    .filter((order) => Boolean(order.id && order.createdAt))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function loadCustomersFromFirebase(): Promise<AdminCustomerRecord[]> {
  if (!projectId) return [];
  const docs = await getCollection("clientes");
  return docs
    .map(({ id, data }) => ({ id, ...(data as Partial<AdminCustomerRecord>) }))
    .sort((a, b) => String(b.actualizadoEn ?? "").localeCompare(String(a.actualizadoEn ?? "")));
}

export async function loadPointsFromFirebase(): Promise<AdminPointsRecord[]> {
  if (!projectId) return [];
  const docs = await getCollection("puntos_movimientos");
  return docs
    .map(({ id, data }) => ({ id, ...(data as Partial<AdminPointsRecord>) }))
    .sort((a, b) => String(b.creadoEn ?? "").localeCompare(String(a.creadoEn ?? "")));
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const now = new Date().toISOString();
  await Promise.allSettled([
    safePatch("pedidos", orderId, { status, actualizadoEn: now, updatedAt: now }),
    safePatch("comandas", orderId, { estado: status, actualizadoEn: now, updatedAt: now }),
  ]);
}

export async function saveProductToFirebase(product: AdminProduct) {
  await safePatch("productos", product.id, {
    ...product,
    activo: product.active !== false,
    orden: product.order ?? 999,
    imagenUrl: product.imageUrl || product.image,
    actualizadoEn: new Date().toISOString(),
  });
}

export async function saveCategoryToFirebase(category: AdminCategory) {
  await safePatch("categorias", category.id, {
    ...category,
    activo: category.active !== false,
    orden: category.order ?? 999,
    actualizadoEn: new Date().toISOString(),
  });
}
