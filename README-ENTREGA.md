# Sushilito Obregón — Entrega para desarrollo

Proyecto: menú digital tipo app de pedidos, optimizado para móvil.
Stack: **TanStack Start v1 + React 19 + Vite 7 + Tailwind v4 + shadcn/ui**.

---

## 1. Cómo correr el proyecto

```bash
bun install      # o: npm install / pnpm install
bun run dev      # levanta Vite en http://localhost:8080
bun run build    # build de producción
```

Node 20+. Si no usas Bun, cualquier package manager funciona (sólo borra `bunfig.toml`).

---

## 2. Estructura clave

```
src/
├── routes/                      # File-based routing (TanStack Router)
│   ├── __root.tsx               # Layout raíz (head, providers)
│   ├── index.tsx                # Home: hero + categorías + pedido
│   ├── checkout.tsx             # Pantalla de pedido alternativa
│   ├── cuenta.tsx               # Mi cuenta / historial / puntos (UI mock)
│   ├── sucursales.tsx           # Listado de sucursales
│   └── admin.tsx                # Panel admin (UI mock)
│
├── components/menu/             # Componentes de la app de menú
│   ├── AppHeader.tsx            # Header sticky con logo + sucursal + carrito
│   ├── CategoryGrid.tsx         # Grid de categorías (paso 2 del flujo)
│   ├── ProductCard.tsx          # Tarjeta de producto
│   ├── ProductModal.tsx         # Modal para agregar producto al pedido
│   ├── CartSheet.tsx            # Sheet lateral del carrito
│   ├── OrderForm.tsx            # Datos de entrega + resumen + WhatsApp
│   ├── Gallery.tsx              # Galería visual
│   ├── FloatingCartBar.tsx      # Barra flotante "Ver pedido"
│   ├── FloatingWhatsApp.tsx     # Botón flotante WhatsApp
│   ├── CategoryNav.tsx          # (legacy) nav de categorías
│   └── HowToOrder.tsx           # (legacy) cómo ordenar
│
├── components/ui/               # shadcn/ui (no modificar salvo necesidad)
│
├── data/menu.ts                 # ⚠️ DATOS MOCK: sucursales, categorías,
│                                #    productos, formatMXN()
│
├── lib/store.tsx                # Estado global (React Context):
│                                #    carrito, sucursal seleccionada,
│                                #    addItem/removeItem/clear, subtotal,
│                                #    itemCount.
│                                #    Persistencia: localStorage.
│
├── assets/                      # Logos SVG y punteros .asset.json (CDN)
│
├── styles.css                   # Tokens de marca (rojo/negro), Tailwind v4
├── router.tsx                   # Config del router
├── server.ts / start.ts         # Bootstrap SSR (TanStack Start)
└── routeTree.gen.ts             # ⚠️ AUTO-GENERADO, no editar
```

---

## 3. Identidad de marca (ya aplicada)

Definida en `src/styles.css`:

```css
--brand-red:   #E2231A   /* rojo Sushilito */
--brand-black: #0B0B0B
--brand-bg:    #F5F5F5
--brand-gold:  #F4A261
```

Tipografías: `font-display` (títulos urbanos) + sans-serif para cuerpo.
Logos en `src/assets/`:
- `logo-sushilito.png.asset.json` → versión blanca (hero oscuro)
- `logo-sushilito-dark.png.asset.json` → versión negra (header claro)
- `logo-blanco.svg`, `logo.svg` → variantes legacy

---

## 4. Datos mock (qué reemplazar al conectar backend)

Todo lo simulado vive en **`src/data/menu.ts`** y **`src/lib/store.tsx`**:

### `src/data/menu.ts`
- `sucursales[]` → array con `id`, `name`, `address`, `phone`, `whatsapp`, `hours`.
  **El campo `whatsapp` es el número usado para enviar el pedido** (formato internacional sin `+`, ej. `526441234567`).
- `categories[]` → catálogo de categorías con `id`, `name`, `tagline`, `image`.
- `products[]` → productos con `id`, `categoryId`, `name`, `description`, `price`, `image`, `badge?`.
- `formatMXN(n)` → helper de formato de moneda.

### `src/lib/store.tsx`
- `useStore()` expone: `sucursal`, `setSucursalId`, `cart`, `addItem`, `removeItem`, `updateQty`, `clear`, `subtotal`, `itemCount`.
- Persiste en `localStorage` con clave `sushilito-store`. Al conectar Firebase, reemplazar la persistencia por Firestore manteniendo la misma API pública del hook (los componentes no requieren cambios).

---

## 5. Flujo funcional implementado

1. Elegir sucursal (header dropdown).
2. Ver hero + galería.
3. Elegir categoría (`CategoryGrid`).
4. Ver productos filtrados → abrir `ProductModal` → agregar al pedido.
5. Llenar datos de entrega en `OrderForm` (nombre, teléfono, recoger/domicilio, dirección, método de pago, cambio, notas).
6. Botón final **arma un mensaje y abre WhatsApp Web** apuntando al número de la sucursal seleccionada (`https://wa.me/<whatsapp>?text=...`).

---

## 6. Qué falta conectar (no implementado por decisión del cliente)

| Feature              | Dónde engancharlo                                                                 |
|----------------------|-----------------------------------------------------------------------------------|
| **Firebase**         | Reemplazar persistencia de `src/lib/store.tsx` y datos de `src/data/menu.ts`.    |
| **WhatsApp real**    | Ya funciona vía `wa.me`. Para Cloud API: server function en `src/routes/api/`.   |
| **Comanda imprimible** | Crear ruta `/comanda/$pedidoId` que renderice ticket A4/80mm + `window.print()`. |
| **Historial pedidos**| `src/routes/cuenta.tsx` ya tiene UI; conectar a colección `orders` por usuario.  |
| **Sistema de puntos**| Lógica en `cuenta.tsx`; calcular sobre total de pedido al confirmar.             |
| **Panel admin**      | `src/routes/admin.tsx` tiene UI; falta auth + CRUD de productos/categorías.      |
| **Auth**             | Activar Lovable Cloud (Supabase) o Firebase Auth. El stack ya soporta SSR auth.  |

---

## 7. Assets (CDN Lovable)

Los archivos `*.asset.json` en `src/assets/` son **punteros a un CDN** (R2/Cloudflare).
La URL `/__l5e/assets-v1/...` sólo se sirve desde la infraestructura de Lovable.

**Antes de migrar a otro hosting**, descarga cada asset y reemplaza:

```tsx
// antes
import logo from "@/assets/logo-sushilito.png.asset.json";
<img src={logo.url} />

// después (asset local)
import logo from "@/assets/logo-sushilito.png";
<img src={logo} />
```

Las URLs CDN de cada asset están dentro de su `.asset.json` (campo `url`).

---

## 8. Routing y notas técnicas

- File-based routing: agregar archivo en `src/routes/` y Vite regenera `routeTree.gen.ts`.
- No usar `react-router-dom`. Importar de `@tanstack/react-router`.
- Tailwind v4: tokens en `src/styles.css` con `@theme`, **no hay `tailwind.config.js`**.
- shadcn: componentes en `src/components/ui/`.

---

**Contacto técnico del diseño:** Powered by CLICKSON.
