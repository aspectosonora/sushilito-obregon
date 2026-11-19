import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products, sucursales, type Sucursal, type Product } from "@/data/menu";

export interface CartItem {
  lineId: string;
  productId: string;
  name: string;
  unitPrice: number; // base + extras
  qty: number;
  notes?: string;
  extras: { id: string; label: string; priceDelta: number; qty?: number }[];
  image: string;
  isPromotion?: boolean;
}

interface StoreCtx {
  sucursal: Sucursal;
  setSucursalId: (id: string) => void;
  cart: CartItem[];
  addItem: (p: Product, qty: number, extras: CartItem["extras"], notes?: string) => void;
  updateQty: (lineId: string, qty: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const Ctx = createContext<StoreCtx | null>(null);
const LS_CART = "sushilito.cart";
const LS_SUC = "sushilito.sucursal";

const extrasTotal = (extras: CartItem["extras"]) =>
  extras.reduce((sum, extra) => sum + extra.priceDelta * (extra.qty ?? 1), 0);

const extrasKey = (extras: CartItem["extras"]) =>
  extras.map((extra) => `${extra.id}:${extra.qty ?? 1}`).sort().join(",");

export function StoreProvider({ children }: { children: ReactNode }) {
  const [sucursalId, setSucId] = useState<string>(sucursales[0].id);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const c = localStorage.getItem(LS_CART);
      if (c) {
        const saved = JSON.parse(c) as CartItem[];
        setCart(
          saved.filter((item) => item.productId !== "rol-bomba-casa" ||
            (item.extras ?? []).some((extra) => extra.id.startsWith("bomba-rollo-base:")))
          .map((item) => {
            const product = products.find((entry) => entry.id === item.productId);
            const extras = (item.extras ?? []).map((extra) => ({
              ...extra,
              qty: Math.max(1, Number(extra.qty) || 1),
              priceDelta: product?.extras?.find((option) => option.id === extra.id)?.priceDelta
                ?? extra.priceDelta,
            }));
            return {
              ...item,
              extras,
              image: product?.image ?? item.image,
              unitPrice: product
                ? product.price + extrasTotal(extras)
                : item.unitPrice,
            };
          }),
        );
      }
      const s = localStorage.getItem(LS_SUC);
      if (s) setSucId(s);
    } catch (error) {
      console.warn("No se pudo cargar carrito local", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_CART, JSON.stringify(cart));
    } catch (error) {
      console.warn("No se pudo guardar carrito local", error);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_SUC, sucursalId);
    } catch (error) {
      console.warn("No se pudo guardar sucursal local", error);
    }
  }, [sucursalId]);

  const sucursal = sucursales.find((s) => s.id === sucursalId) ?? sucursales[0];

  const addItem: StoreCtx["addItem"] = (p, qty, extras, notes) => {
    const unitPrice = p.price + extrasTotal(extras);
    setCart((prev) => {
      // match identical config
      const key = `${p.id}__${extrasKey(extras)}__${notes ?? ""}`;
      const existing = prev.find(
        (i) =>
          `${i.productId}__${extrasKey(i.extras)}__${i.notes ?? ""}` === key,
      );
      if (existing) {
        return prev.map((i) => (i === existing ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...prev,
        {
          lineId: crypto.randomUUID(),
          productId: p.id,
          name: p.name,
          unitPrice,
          qty,
          notes,
          extras,
          image: p.image,
          isPromotion: p.tags?.includes("promo") ?? false,
        },
      ];
    });
  };

  const updateQty = (lineId: string, qty: number) =>
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => i.lineId !== lineId)
        : prev.map((i) => (i.lineId === lineId ? { ...i, qty } : i)),
    );

  const removeItem = (lineId: string) => setCart((prev) => prev.filter((i) => i.lineId !== lineId));
  const clearCart = () => setCart([]);

  const subtotal = useMemo(() => cart.reduce((a, i) => a + i.unitPrice * i.qty, 0), [cart]);
  const itemCount = useMemo(() => cart.reduce((a, i) => a + i.qty, 0), [cart]);

  return (
    <Ctx.Provider
      value={{
        sucursal,
        setSucursalId: setSucId,
        cart,
        addItem,
        updateQty,
        removeItem,
        clearCart,
        subtotal,
        itemCount,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore must be used within StoreProvider");
  return v;
}
