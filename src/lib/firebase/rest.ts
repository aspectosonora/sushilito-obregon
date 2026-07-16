import type { Category, Product } from "@/data/menu";
import type { CustomerProfile, OrderStatus, SavedOrder } from "@/lib/orders";
import {
  EMPTY_CUSTOMER,
  clearPendingFirebaseOrder,
  normalizeSavedOrder,
  normalizeStatus,
  savePendingFirebaseOrder,
  statusCode,
} from "@/lib/orders";

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
  email?: string;
  authUid?: string;
  proveedorAuth?: string;
  direccion?: string;
  colonia?: string;
  referencia?: string;
  formaEntrega?: string;
  metodoPago?: string;
  ultimaSucursal?: string;
  ultimoPedidoId?: string;
  suscritoPromociones?: boolean;
  puntosRespaldo?: number;
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

async function getDocument(collection: string, id: string) {
  const baseUrl = firestoreBaseUrl();
  if (!baseUrl) return null;
  const cleanId = encodeURIComponent(id.replace(/\//g, "-"));
  const res = await fetch(`${baseUrl}/${collection}/${cleanId}${apiKeyQuery()}`);
  if (!res.ok) throw new Error(`Firestore read ${collection}/${id} failed: ${res.status}`);
  const json = (await res.json()) as { fields?: Record<string, FirestoreValue> };
  return fromFirestoreFields(json.fields ?? {});
}

function customerId(order: SavedOrder) {
  if (order.customer.authUid) return `auth-${order.customer.authUid}`;
  const phone = order.customer.phone.replace(/\D/g, "");
  return phone ? `tel-${phone}` : `anon-${order.id}`;
}

function customerIdFromProfile(profile: Partial<CustomerProfile>, authUid?: string) {
  if (authUid || profile.authUid) return `auth-${authUid || profile.authUid}`;
  const phone = String(profile.phone || "").replace(/\D/g, "");
  return phone ? `tel-${phone}` : "";
}

function customerToFirestore(
  id: string,
  profile: CustomerProfile,
  now: string,
  extra: Record<string, unknown> = {},
) {
  return {
    id,
    nombre: profile.name,
    telefono: profile.phone,
    email: profile.email || "",
    authUid: profile.authUid || "",
    proveedorAuth: profile.provider || "",
    direccion: profile.address,
    colonia: profile.colony,
    referencia: profile.reference,
    formaEntrega: profile.deliveryMode,
    metodoPago: profile.paymentMethod,
    suscritoPromociones: Boolean(profile.marketingOptIn),
    actualizadoEn: now,
    ...extra,
  };
}

function customerFromRecord(record: Partial<AdminCustomerRecord>): CustomerProfile {
  return {
    ...EMPTY_CUSTOMER,
    name: record.nombre || "",
    phone: record.telefono || "",
    email: record.email || "",
    authUid: record.authUid || "",
    provider: record.proveedorAuth || "",
    address: record.direccion || "",
    colony: record.colonia || "",
    reference: record.referencia || "",
    deliveryMode: record.formaEntrega === "domicilio" ? "domicilio" : "recoger",
    paymentMethod: record.metodoPago === "transferencia" ? "transferencia" : "efectivo",
    marketingOptIn: Boolean(record.suscritoPromociones),
  };
}

export async function syncOrderToFirebase(order: SavedOrder): Promise<FirebaseSyncResult> {
  if (!projectId) {
    savePendingFirebaseOrder(order);
    return { ok: false, reason: "missing_config" };
  }

  try {
    const cid = customerId(order);
    const now = new Date().toISOString();
    const normalizedStatus = normalizeStatus(order.status);
    const code = statusCode(normalizedStatus);
    const results = await Promise.allSettled([
      safePatch("pedidos", order.id, {
        ...order,
        status: code,
        statusText: normalizedStatus,
        estado: normalizedStatus,
        estadoCodigo: code,
        clienteId: cid,
        actualizadoEn: now,
      }),
      safePatch(
        "clientes",
        cid,
        customerToFirestore(cid, order.customer, now, {
          ultimaSucursal: order.sucursal.id,
          ultimoPedidoId: order.id,
          puntosRespaldo: order.pointsEarned - order.pointsRedeemed,
        }),
      ),
      safePatch("comandas", order.id, {
        id: order.id,
        pedidoId: order.id,
        folio: order.folio,
        sucursal: order.sucursal,
        cliente: order.customer,
        productos: order.items,
        subtotal: order.subtotal,
        envio: order.shipping,
        envioPendiente: Boolean(order.shippingPending),
        puntosCanjeados: order.pointsRedeemed,
        puntosGenerados: order.pointsEarned,
        total: order.total,
        metodoPago: order.customer.paymentMethod,
        transferencia: {
          instrucciones: order.transferInstructions || "",
          imagenUrl: order.transferImageUrl || "",
        },
        estado: normalizedStatus,
        status: code,
        statusText: normalizedStatus,
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
    .map(({ data }) => normalizeSavedOrder(data as Partial<SavedOrder>))
    .filter((order): order is SavedOrder => Boolean(order))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export async function saveCustomerProfileToFirebase(profile: CustomerProfile) {
  if (!projectId) return false;
  const id = customerIdFromProfile(profile);
  if (!id) return false;
  return safePatch("clientes", id, customerToFirestore(id, profile, new Date().toISOString()));
}

export async function loadCustomerProfileFromFirebase(
  profile: Partial<CustomerProfile>,
): Promise<CustomerProfile | null> {
  if (!projectId) return null;
  const ids = [
    customerIdFromProfile(profile, profile.authUid),
    customerIdFromProfile({ phone: profile.phone || "" }),
  ].filter((id, index, list) => id && list.indexOf(id) === index);
  for (const id of ids) {
    try {
      const data = await getDocument("clientes", id);
      if (data) return customerFromRecord(data as Partial<AdminCustomerRecord>);
    } catch (error) {
      console.warn("Perfil Firebase no disponible", error);
    }
  }
  return null;
}

export async function loadOrdersForCustomerFromFirebase(
  profile: Partial<CustomerProfile>,
): Promise<SavedOrder[]> {
  const allOrders = await loadOrdersFromFirebase();
  const profileId = customerIdFromProfile(profile);
  const phone = String(profile.phone || "").replace(/\D/g, "");
  const authUid = profile.authUid || "";
  return allOrders.filter((order) => {
    const orderPhone = order.customer.phone.replace(/\D/g, "");
    const orderAuthUid = order.customer.authUid || "";
    const clienteId = (order as SavedOrder & { clienteId?: string }).clienteId;
    return (
      (phone && orderPhone === phone) ||
      (authUid && orderAuthUid === authUid) ||
      (profileId && clienteId === profileId)
    );
  });
}

export async function loadPointsForCustomerFromFirebase(
  profile: Partial<CustomerProfile>,
): Promise<AdminPointsRecord[]> {
  if (!projectId) return [];
  const profileId = customerIdFromProfile(profile);
  const docs = await loadPointsFromFirebase();
  return docs.filter((movement) => movement.clienteId === profileId);
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
  const code = statusCode(status);
  await Promise.allSettled([
    safePatch("pedidos", orderId, {
      status: code,
      statusText: status,
      estado: status,
      estadoCodigo: code,
      actualizadoEn: now,
      updatedAt: now,
    }),
    safePatch("comandas", orderId, {
      estado: status,
      status: code,
      statusText: status,
      actualizadoEn: now,
      updatedAt: now,
    }),
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
