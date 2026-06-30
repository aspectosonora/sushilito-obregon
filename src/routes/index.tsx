import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/menu/AppHeader";
import { CategoryGrid } from "@/components/menu/CategoryGrid";
import { ProductCard } from "@/components/menu/ProductCard";
import { ProductModal } from "@/components/menu/ProductModal";
import { FloatingCartBar } from "@/components/menu/FloatingCartBar";
import { FloatingWhatsApp } from "@/components/menu/FloatingWhatsApp";
import { Gallery } from "@/components/menu/Gallery";
import { OrderForm } from "@/components/menu/OrderForm";
import { categories, products, sucursales, type Product } from "@/data/menu";
import { useStore } from "@/lib/store";
import { availablePoints, loadOrderHistory } from "@/lib/orders";
import {
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Check,
  ChevronRight,
  ArrowLeft,
  History,
  LogIn,
  Star,
} from "lucide-react";
import heroBrand from "@/assets/hero-brand.png";
import logoBlanco from "@/assets/logo-blanco.svg";
import logoSushilito from "@/assets/logo-sushilito.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sushilito Obregón — Pide sushi a domicilio" },
      {
        name: "description",
        content:
          "Menú digital de Sushilito Obregón. Elige sucursal, arma tu pedido y envíalo por WhatsApp.",
      },
      { property: "og:title", content: "Sushilito Obregón — Menú a domicilio" },
      {
        property: "og:description",
        content: "El sushi más sano, rápido y delicioso de Ciudad Obregón.",
      },
      { property: "og:image", content: heroBrand },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { sucursal, setSucursalId } = useStore();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [accountStats, setAccountStats] = useState({ points: 0, orders: 0 });

  const categoryItems = useMemo(
    () => (selectedCat ? products.filter((p) => p.categoryId === selectedCat) : []),
    [selectedCat],
  );
  const currentCategory = categories.find((c) => c.id === selectedCat) ?? null;

  const handleSelectCategory = (id: string) => {
    setSelectedCat(id);
    setTimeout(() => {
      const el = document.getElementById("category-detail");
      if (el)
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - 80,
          behavior: "smooth",
        });
    }, 50);
  };

  const handleBack = () => {
    setSelectedCat(null);
    setTimeout(() => {
      const el = document.getElementById("categorias");
      if (el)
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - 80,
          behavior: "smooth",
        });
    }, 50);
  };

  useEffect(() => {
    if (selectedCat) {
      const exists = categories.some((c) => c.id === selectedCat);
      if (!exists) setSelectedCat(null);
    }
  }, [selectedCat]);

  useEffect(() => {
    setAccountStats({ points: Math.max(0, availablePoints()), orders: loadOrderHistory().length });
  }, []);

  const waLink = (s = sucursal) =>
    `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(`Hola Sushilito ${s.name}, quiero hacer un pedido.`)}`;

  return (
    <div className="min-h-screen pb-28 bg-[var(--brand-bg)]">
      <AppHeader />

      {/* HERO — logo protagonista sobre fondo oscuro con imagen al fondo */}
      <section className="mx-auto max-w-3xl px-3 sm:px-4 pt-3">
        <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-black/40 bg-[var(--brand-black)] min-h-[460px] sm:min-h-[540px] flex flex-col items-center justify-center text-center px-6 py-10 sm:py-14">
          {/* Imagen de fondo más visible */}
          <img
            src={heroBrand}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover opacity-55 select-none"
            draggable={false}
          />
          {/* Overlay más sutil para que se note la imagen */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/70" />
          {/* Glow rojo decorativo */}
          <div className="absolute -top-20 -right-20 size-72 rounded-full bg-[var(--brand-red)]/25 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 size-72 rounded-full bg-[var(--brand-red)]/20 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center max-w-xl">
            {/* Logo gigante protagonista */}
            <img
              src={logoSushilito}
              alt="Sushilito Obregón"
              className="w-64 sm:w-80 h-auto drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)] mb-6"
              draggable={false}
            />

            {/* Sucursal */}
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-[0.28em] px-4 py-1.5 rounded-full mb-4">
              <MapPin className="size-3 text-[var(--brand-red)]" />
              Sucursal · {sucursal.name}
            </div>

            {/* Frase más pequeña */}
            <h1 className="font-display text-white text-base sm:text-xl leading-snug tracking-tight max-w-sm">
              Somos el sushi <span className="text-[var(--brand-red)]">más sano</span>,{" "}
              <span className="text-[var(--brand-red)]">más rápido</span> y{" "}
              <span className="text-[var(--brand-red)]">delicioso</span> de la ciudad.
            </h1>

            {/* CTA */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
              <button
                onClick={() => {
                  const el = document.getElementById("categorias");
                  if (el)
                    window.scrollTo({
                      top: el.getBoundingClientRect().top + window.scrollY - 70,
                      behavior: "smooth",
                    });
                }}
                className="inline-flex items-center justify-center gap-1.5 bg-[var(--brand-red)] hover:bg-white hover:text-[var(--brand-red)] text-white text-sm font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition shadow-lg shadow-[var(--brand-red)]/40"
              >
                Ver menú <ChevronRight className="size-4" />
              </button>
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 bg-white/10 backdrop-blur hover:bg-white/20 text-white text-sm font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition border border-white/25"
              >
                <MessageCircle className="size-4" /> WhatsApp
              </a>
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 text-[10px] text-white/80 uppercase tracking-wider">
              <Clock className="size-3 text-[var(--brand-red)]" /> {sucursal.hours}
            </div>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <Gallery />

      {/* CATEGORY GRID */}
      {!selectedCat && <CategoryGrid onSelect={handleSelectCategory} />}

      {/* CATEGORY DETAIL */}
      {selectedCat && currentCategory && (
        <section id="category-detail" className="mx-auto max-w-3xl px-4 mt-6 scroll-mt-24">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--brand-black)] bg-white hover:bg-[var(--brand-red)] hover:text-white border border-black/10 px-3 py-2 rounded-full transition shadow-sm"
          >
            <ArrowLeft className="size-3.5" /> Volver a categorías
          </button>

          <div className="mt-4 flex items-center gap-3">
            <div className="h-9 w-1.5 bg-[var(--brand-red)] rounded-full" />
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--brand-red)] font-bold">
                Categoría
              </div>
              <h2 className="font-display text-3xl tracking-wide uppercase leading-none">
                {currentCategory.name}
              </h2>
              {currentCategory.tagline && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {currentCategory.tagline}
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-white px-2 py-1 rounded-full border">
              {categoryItems.length} prod.
            </span>
          </div>

          {categoryItems.length === 0 ? (
            <div className="mt-6 bg-white border rounded-2xl p-6 text-center text-sm text-muted-foreground">
              Pronto agregaremos productos a esta categoría.
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categoryItems.map((p) => (
                <ProductCard key={p.id} product={p} onOpen={setModalProduct} />
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-white bg-[var(--brand-black)] hover:bg-[var(--brand-red)] px-4 py-2.5 rounded-full transition"
            >
              <ArrowLeft className="size-3.5" /> Ver otras categorías
            </button>
          </div>
        </section>
      )}

      {/* DATOS DE ENTREGA + TU PEDIDO */}
      <OrderForm />

      {/* HISTORIAL Y PUNTOS */}
      <section className="mx-auto max-w-3xl px-4 mt-10">
        <div className="rounded-2xl bg-[var(--brand-black)] text-white p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-[var(--brand-red)]/30 blur-2xl" />
          <div className="relative flex items-center gap-4 flex-wrap">
            <div className="size-12 grid place-items-center rounded-2xl bg-[var(--brand-red)] shadow-lg shadow-[var(--brand-red)]/40">
              <Star className="size-6 fill-white text-white" />
            </div>
            <div className="flex-1 min-w-[180px]">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--brand-gold)] font-bold">
                Inicia sesión
              </div>
              <div className="font-display text-2xl">
                {accountStats.points} puntos · {accountStats.orders} pedidos
              </div>
              <div className="text-xs text-white/70 mt-0.5">
                Acumula puntos y recibe promociones.
              </div>
            </div>
            <Link
              to="/cuenta"
              className="inline-flex items-center gap-1.5 bg-white text-[var(--brand-black)] hover:bg-[var(--brand-red)] hover:text-white text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-xl transition"
            >
              <LogIn className="size-3.5" /> Entrar
            </Link>
            <Link
              to="/cuenta"
              className="inline-flex items-center gap-1.5 bg-white/10 text-white hover:bg-white/20 text-xs font-bold uppercase tracking-wide px-4 py-2.5 rounded-xl transition"
            >
              <History className="size-3.5" /> Historial
            </Link>
          </div>
        </div>
      </section>

      {/* SUCURSALES + MAPA */}
      <main className="mx-auto max-w-3xl px-4 mt-10 space-y-9">
        <section id="sucursales" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-7 w-1.5 bg-[var(--brand-red)] rounded-full" />
            <h2 className="font-display text-2xl tracking-wide uppercase">Nuestras sucursales</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {sucursales.map((s) => {
              const active = s.id === sucursal.id;
              return (
                <div
                  key={s.id}
                  className={`relative rounded-2xl p-4 transition border-2 overflow-hidden ${active ? "border-[var(--brand-red)] bg-white shadow-lg shadow-[var(--brand-red)]/10" : "border-transparent bg-white hover:border-[var(--brand-red)]/30"}`}
                >
                  {active && (
                    <div className="absolute top-0 right-0 bg-[var(--brand-red)] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-bl-xl inline-flex items-center gap-1">
                      <Check className="size-3" />
                      Actual
                    </div>
                  )}
                  <h3 className="font-display text-2xl tracking-wide pr-12">{s.name}</h3>
                  <div className="mt-2.5 space-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <MapPin className="size-3.5 mt-0.5 shrink-0 text-[var(--brand-red)]" />
                      <span className="line-clamp-2">{s.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="size-3.5 text-[var(--brand-red)]" />
                      <span>{s.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="size-3.5 text-[var(--brand-red)]" />
                      <span>{s.hours}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setSucursalId(s.id)}
                      disabled={active}
                      className="flex-1 bg-[var(--brand-black)] disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wide py-2.5 rounded-xl hover:bg-[var(--brand-red)] transition"
                    >
                      {active ? "Seleccionada" : "Elegir sucursal"}
                    </button>
                    <a
                      href={waLink(s)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`WhatsApp ${s.name}`}
                      className="size-10 grid place-items-center rounded-xl bg-[#25D366] text-white hover:scale-105 transition shadow"
                    >
                      <MessageCircle className="size-4" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="contacto" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-7 w-1.5 bg-[var(--brand-red)] rounded-full" />
            <h2 className="font-display text-2xl tracking-wide uppercase">Encuéntranos</h2>
          </div>
          <div className="rounded-2xl overflow-hidden bg-white border shadow-sm">
            <div className="aspect-[16/9] w-full bg-[var(--brand-black)]">
              <iframe
                title="Sushilito Morelos en Google Maps"
                src="https://www.google.com/maps?q=Av.+Jos%C3%A9+Mar%C3%ADa+Morelos+y+Pav%C3%B3n+1001,+Ciudad+Obreg%C3%B3n&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="p-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--brand-red)] font-bold">
                Sucursal Morelos
              </div>
              <p className="mt-1 text-sm text-foreground/80">
                Av. José María Morelos y Pavón 1001, esquina con Quintana Roo, Col. Cuauhtémoc,
                Cdad. Obregón, Sonora.
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Phone className="size-3 text-[var(--brand-red)]" />
                  644 413 5070
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3 text-[var(--brand-red)]" />
                  Lun a Dom · 12:00 PM - 10:00 PM
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-12 bg-[var(--brand-black)] text-white">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="flex items-center gap-3">
            <img src={logoBlanco} alt="Sushilito" className="h-12 w-auto" />
            <div>
              <div className="font-display text-2xl leading-none">SUSHILITO OBREGÓN</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--brand-gold)] mt-1">
                Restaurant Bar · sushi sonorense
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/70 max-w-md">
            El sushi más sano, rápido y delicioso de Ciudad Obregón.
          </p>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="font-bold uppercase text-[10px] tracking-[0.2em] text-[var(--brand-red)] mb-2">
                Sucursales
              </div>
              <ul className="space-y-1 text-white/70">
                {sucursales.map((s) => (
                  <li key={s.id}>{s.name}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-bold uppercase text-[10px] tracking-[0.2em] text-[var(--brand-red)] mb-2">
                Horario
              </div>
              <p className="text-white/70">
                Lun a Dom
                <br />
                12:00 PM - 10:00 PM
              </p>
            </div>
            <div>
              <div className="font-bold uppercase text-[10px] tracking-[0.2em] text-[var(--brand-red)] mb-2">
                Enlaces
              </div>
              <ul className="space-y-1 text-white/70">
                <li>
                  <Link to="/sucursales" className="hover:text-white">
                    Sucursales
                  </Link>
                </li>
                <li>
                  <Link to="/cuenta" className="hover:text-white">
                    Mi cuenta
                  </Link>
                </li>
                <li>
                  <Link to="/checkout" className="hover:text-white">
                    Mi pedido
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.2em]">
            <span className="text-white/50">© {new Date().getFullYear()} Sushilito Obregón</span>
            <span className="text-white/60">
              Powered by{" "}
              <span className="text-[var(--brand-red)] font-black tracking-[0.25em]">CLICKSON</span>
            </span>
          </div>
        </div>
      </footer>

      <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />
      <FloatingCartBar />
      <FloatingWhatsApp />
    </div>
  );
}
