import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { AppHeader } from "@/components/menu/AppHeader";
import { OrderForm } from "@/components/menu/OrderForm";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Tu pedido - Sushilito Obregon" }] }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { cart } = useStore();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--brand-bg)]">
        <AppHeader />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <div className="size-20 mx-auto rounded-full bg-white grid place-items-center mb-4 border border-black/10">
            <ShoppingBag className="size-9 text-[var(--brand-red)]" />
          </div>
          <h2 className="text-xl font-bold">Tu pedido esta vacio</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Agrega algunos rollos del menu para continuar.
          </p>
          <Link
            to="/"
            className="inline-block mt-5 bg-[var(--brand-red)] text-white font-semibold px-5 py-3 rounded-xl"
          >
            Ir al menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 bg-[var(--brand-bg)]">
      <AppHeader />
      <div className="mx-auto max-w-3xl px-4 pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Seguir comprando
        </Link>
      </div>
      <OrderForm />
    </div>
  );
}
