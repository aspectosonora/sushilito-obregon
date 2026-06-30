import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatMXN } from "@/data/menu";

export function FloatingCartBar() {
  const { itemCount, subtotal } = useStore();
  if (itemCount === 0) return null;

  return (
    <div className="fixed bottom-3 inset-x-0 z-40 px-3 pointer-events-none">
      <div className="mx-auto max-w-md pointer-events-auto">
        <Link
          to="/checkout"
          className="flex items-center justify-between gap-3 bg-[var(--brand-red)] hover:bg-[var(--brand-black)] text-white px-4 py-3.5 rounded-2xl shadow-2xl shadow-black/30 transition"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingBag className="size-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-white text-[var(--brand-red)] text-[10px] font-bold rounded-full min-w-[18px] h-[18px] inline-flex items-center justify-center px-1">
                {itemCount}
              </span>
            </div>
            <span className="font-bold">Ver pedido</span>
          </div>
          <span className="font-bold">{formatMXN(subtotal)}</span>
        </Link>
      </div>
    </div>
  );
}
