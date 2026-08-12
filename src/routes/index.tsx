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
import { categories, formatMXN, products, promotions, sucursales, type Product } from "@/data/menu";
import { useStore } from "@/lib/store";
import {
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Check,
  ChevronRight,
  ArrowLeft,
  LogIn,
  X,
} from "lucide-react";
import heroBrand from "@/assets/hero-brand.png";
import logoBlanco from "@/assets/logo-blanco.svg";
import logoSushilito from "@/assets/logo-sushilito.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pedidos Sushilitos — Pide sushi a domicilio" },
      {
        name: "description",
        content:
          "Menú digital de Pedidos Sushilitos. Elige sucursal, arma tu pedido y envíalo por WhatsApp.",
      },
      { property: "og:title", content: "Pedidos Sushilitos — Menú a domicilio" },
      {
        property: "og:description",
        content: "El sushi más sano, rápido y delicioso de Ciudad Obregón.",
      },
      { property: "og:image", content: heroBrand },
    ],
  }),
  component: MenuPage,
});

const mapEmbedUrl = (address: string) =>
  `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

const mapDirectionsUrl = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

function PromotionsStrip({ onOpen }: { onOpen: (product: Product) => void }) {
  return (
    <section className="mx-auto max-w-3xl px-4 mt-5">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--brand-red)] font-bold">
            Promociones
          </div>
          <h2 className="font-display text-2xl tracking-wide uppercase leading-none">
            Promos de la semana
          </h2>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-white px-2 py-1 rounded-full border">
          {promotions.length} promos
        </span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
        {promotions.map((promo) => (
          <button
            key={promo.id}
            onClick={() => onOpen(promo)}
            className="group relative snap-start shrink-0 w-[190px] sm:w-[210px] h-20 text-left rounded-xl overflow-hidden border-2 border-[var(--brand-red)] shadow-[0_10px_28px_-14px_rgba(226,31,29,0.9)] hover:shadow-[0_14px_32px_-12px_rgba(226,31,29,1)] transition active:scale-[0.99]"
          >
            <img
              src={promo.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/68 to-black/30" />
            <div className="relative z-10 h-full px-3 py-2 flex flex-col justify-between">
              <div className="min-w-0">
                <div className="text-[9px] font-black uppercase tracking-wider text-[var(--brand-red)] drop-shadow">
                  Promo
                </div>
                <h3 className="font-black text-white text-[12px] leading-tight line-clamp-2 drop-shadow">
                  {promo.name}
                </h3>
              </div>
              <div className="flex items-end justify-between gap-2">
                <span className="font-display text-2xl leading-none text-white drop-shadow">
                  {formatMXN(promo.price)}
                </span>
                <span className="rounded-md bg-[var(--brand-red)] px-2 py-1 text-[9px] font-black uppercase tracking-wide text-white shadow">
                  Agregar
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function MenuPage() {
  const { sucursal, setSucursalId } = useStore();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [showPromoPopup, setShowPromoPopup] = useState(true);

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
              alt="Pedidos Sushilitos"
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

      <PromotionsStrip onOpen={setModalProduct} />

      {/* INICIA SESION */}
      <section className="mx-auto max-w-3xl px-4 mt-5">
        <div className="rounded-3xl bg-white border border-black/10 shadow-sm px-4 py-3 sm:px-5 sm:py-4 flex items-center gap-4">
          <div className="size-12 sm:size-14 rounded-full bg-[var(--brand-black)]/5 grid place-items-center shrink-0">
            <LogIn className="size-6 text-[var(--brand-red)]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-black uppercase tracking-tight text-[var(--brand-black)] leading-tight">
              Inicia sesión
            </div>
            <div className="text-xs sm:text-sm text-[var(--brand-black)]/70 leading-snug">
              Guarda tus datos y recibe promociones
            </div>
          </div>
          <Link
            to="/cuenta"
            className="shrink-0 inline-flex items-center justify-center rounded-full bg-[var(--brand-black)] hover:bg-[var(--brand-red)] text-white text-xs font-black uppercase tracking-wide px-5 py-3 transition"
          >
            Entrar
          </Link>
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
                title={`Sushilito ${sucursal.name} en Google Maps`}
                src={mapEmbedUrl(sucursal.address)}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="p-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--brand-red)] font-bold">
                Sucursal {sucursal.name}
              </div>
              <p className="mt-1 text-sm text-foreground/80">
                {sucursal.address}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Phone className="size-3 text-[var(--brand-red)]" />
                  {sucursal.phone}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3 text-[var(--brand-red)]" />
                  {sucursal.hours}
                </span>
                <a
                  href={mapDirectionsUrl(sucursal.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--brand-red)] font-bold"
                >
                  <MapPin className="size-3" />
                  Como llegar
                </a>
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
              <div className="font-display text-2xl leading-none">PEDIDOS SUSHILITOS</div>
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
                12:00 PM - 11:00 PM
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
            <span className="text-white/50">© {new Date().getFullYear()} Pedidos Sushilitos</span>
            <span className="text-white/60">
              Powered by{" "}
              <span className="text-[var(--brand-red)] font-black tracking-[0.25em]">CLICKSON</span>
            </span>
          </div>
          <div className="mt-4 flex justify-center">
            <Link
              to="/admin"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-5 py-2 text-[10px] font-black uppercase tracking-wide text-white/60 hover:border-white/40 hover:bg-white/10 hover:text-white transition"
            >
              Acceso admin
            </Link>
          </div>
        </div>
      </footer>

      <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />
      {showPromoPopup && <PromoPopup onClose={() => setShowPromoPopup(false)} />}
      <FloatingCartBar />
      <FloatingWhatsApp />
    </div>
  );
}

function PromoPopup({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-sm px-4 py-5 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Promociones de la semana"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[560px] max-h-[92vh]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar promociones"
          className="absolute right-2 top-2 z-10 size-10 rounded-full bg-black/70 text-white grid place-items-center hover:bg-[var(--brand-red)] transition"
        >
          <X className="size-7" />
        </button>
        <img
          src="/promo-semana-sushilito.png"
          alt="Promociones de la semana de Sushilito"
          className="w-full max-h-[92vh] object-contain rounded-2xl shadow-2xl"
        />
      </div>
    </div>
  );
}
