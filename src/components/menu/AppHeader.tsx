import { Link } from "@tanstack/react-router";
import { ShoppingBag, MapPin, ChevronDown, User } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { sucursales } from "@/data/menu";
import { CartSheet } from "./CartSheet";
import logoSushilito from "@/assets/logo-sushilito-dark.png";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function AppHeader() {
  const { sucursal, setSucursalId, itemCount } = useStore();
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-black/5 shadow-sm">
        <div className="mx-auto max-w-3xl px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3">
          {/* Logo grande, transparente */}
          <Link to="/" aria-label="Inicio Sushilito" className="shrink-0 flex items-center">
            <img src={logoSushilito} alt="Sushilito Obregón" className="h-20 sm:h-24 w-auto" />
          </Link>

          {/* Sucursal protagonista */}
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger className="flex-1 min-w-0 inline-flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--brand-black)] text-white hover:bg-black transition shadow-sm">
              <MapPin className="size-4 text-[var(--brand-red)] shrink-0" />
              <div className="min-w-0 text-left leading-none">
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/50">Sucursal</div>
                <div className="text-sm font-bold truncate">{sucursal.name}</div>
              </div>
              <ChevronDown className="size-4 text-white/70 shrink-0 ml-auto" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Elige tu sucursal</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sucursales.map(s => (
                <DropdownMenuItem key={s.id} onClick={() => setSucursalId(s.id)} className="flex flex-col items-start gap-0.5 py-2.5 cursor-pointer">
                  <div className="flex items-center gap-2 font-semibold">
                    {s.name}
                    {s.id === sucursal.id && <span className="text-[9px] bg-[var(--brand-red)] text-white px-1.5 py-0.5 rounded uppercase tracking-wider">Actual</span>}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-1">{s.address}</div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/cuenta" className="shrink-0 size-10 grid place-items-center rounded-full hover:bg-black/5 transition" aria-label="Mi cuenta">
            <User className="size-5 text-[var(--brand-black)]" />
          </Link>

          <button
            onClick={() => setCartOpen(true)}
            className="relative shrink-0 inline-flex items-center gap-1.5 bg-[var(--brand-red)] hover:bg-[var(--brand-black)] text-white px-3 sm:px-4 py-2.5 rounded-full font-bold text-sm transition shadow-md shadow-[var(--brand-red)]/30"
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline uppercase tracking-wide">Mi pedido</span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-[var(--brand-red)] text-[10px] font-black rounded-full min-w-[20px] h-[20px] inline-flex items-center justify-center px-1 border-2 border-[var(--brand-red)] shadow">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
