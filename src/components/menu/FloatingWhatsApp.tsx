import { MessageCircle } from "lucide-react";
import { useStore } from "@/lib/store";

export function FloatingWhatsApp() {
  const { sucursal, itemCount } = useStore();
  const url = `https://wa.me/${sucursal.whatsapp}?text=${encodeURIComponent(
    `Hola Sushilito ${sucursal.name}, quiero hacer un pedido.`,
  )}`;
  // hide on top of cart bar when items in cart on mobile
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className={`fixed right-4 z-30 size-12 grid place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/30 hover:scale-110 transition ${itemCount > 0 ? "bottom-24" : "bottom-5"}`}
    >
      <MessageCircle className="size-6 fill-white" />
    </a>
  );
}
