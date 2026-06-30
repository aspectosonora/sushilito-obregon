// Menú Sushilito Obregón
import g1 from "@/assets/gallery-1.png"; // empanizado rollo
import g2 from "@/assets/gallery-2.png"; // rollo soya
import g3 from "@/assets/gallery-3.png"; // bebida
import g4 from "@/assets/gallery-4.png"; // boneless
import food2 from "@/assets/food-2.png";
import food3 from "@/assets/food-3.png";
import food5 from "@/assets/food-5.png";

export type ProductTag = "horneado" | "picante" | "favorito" | "promo" | "nuevo";

export interface ProductOption { id: string; label: string; priceDelta: number; }

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tags?: ProductTag[];
  extras?: ProductOption[];
}

export interface Category {
  id: string;
  name: string;
  tagline?: string;
}

export const categories: Category[] = [
  { id: "entradas", name: "Entradas", tagline: "Para abrir apetito" },
  { id: "rollos", name: "Rollos", tagline: "Nuestra especialidad" },
  { id: "platillos", name: "Platillos", tagline: "Cocina caliente" },
  { id: "sopas", name: "Sopas", tagline: "Caldos japoneses" },
  { id: "kids", name: "Menú Kids", tagline: "Para los peques" },
  { id: "bebidas", name: "Bebidas", tagline: "Frías y refrescantes" },
];

const IMG_ROLL = g1;
const IMG_ROLL2 = g2;
const IMG_BONELESS = g4;
const IMG_BEB = g3;
const IMG_PLAT = food2;
const IMG_SOPA = food3;
const IMG_KIDS = food5;

export const products: Product[] = [
  // ===== ENTRADAS =====
  { id: "ent-boneless", categoryId: "entradas", name: "Boneless", price: 195, image: IMG_BONELESS, tags: ["favorito"],
    description: "Tiras de pechuga de pollo empanizadas y bañadas en salsa Buffalo, BBQ o mixta. 240gr de pollo." },
  { id: "ent-boneless-casa", categoryId: "entradas", name: "Boneless de la Casa", price: 195, image: IMG_BONELESS, tags: ["nuevo"],
    description: "¡Inmejorables! Nueva salsa especial de la casa. 240gr de pollo." },
  { id: "ent-botana-especial", categoryId: "entradas", name: "Botana Especial", price: 215, image: IMG_PLAT,
    description: "Camarones con phila (3 pz), deditos de queso (3 pz), chile relleno (1 pz) y cebollitas capeadas." },
  { id: "ent-botana-roja", categoryId: "entradas", name: "Botana Roja", price: 215, image: IMG_BONELESS, tags: ["picante"],
    description: "Chiles rellenos, boneless, camarones buffalo y papas sazonadas." },
  { id: "ent-brochetas", categoryId: "entradas", name: "Brochetas (2 pz)", price: 190, image: IMG_PLAT,
    description: "Camarón, pollo o surimi con chile morrón, cubierto con queso phila o manchego empanizado, con arroz y tampico." },
  { id: "ent-cam-buffalo", categoryId: "entradas", name: "Camarones Buffalo (10 pz)", price: 190, image: IMG_BONELESS, tags: ["picante"],
    description: "" },
  { id: "ent-cam-phila", categoryId: "entradas", name: "Camarones con Phila (8 pz)", price: 190, image: IMG_PLAT,
    description: "Camarones con queso phila empanizados acompañados con arroz blanco y tampico." },
  { id: "ent-cam-tempura", categoryId: "entradas", name: "Camarones Tempura (10 pz)", price: 190, image: IMG_PLAT,
    description: "" },
  { id: "ent-chiles-caribe", categoryId: "entradas", name: "Chiles Caribe Rescoldados", price: 80, image: IMG_PLAT, tags: ["picante"],
    description: "" },
  { id: "ent-chiles-rellenos", categoryId: "entradas", name: "Chiles Rellenos (2 Caribe)", price: 140, image: IMG_PLAT, tags: ["picante"],
    description: "Chile caribe empanizado relleno con camarón, surimi, tocino y queso phila." },
  { id: "ent-dedos-queso", categoryId: "entradas", name: "Dedos de Queso (6 pz)", price: 130, image: IMG_PLAT,
    description: "Tiras de queso phila o manchego empanizados." },
  { id: "ent-edamames", categoryId: "entradas", name: "Edamames", price: 115, image: IMG_PLAT,
    description: "100% saludables, vaina de soja servida con limón, sal y chile tajín." },
  { id: "ent-ensalada-boneless", categoryId: "entradas", name: "Ensalada Boneless", price: 195, image: IMG_BONELESS,
    description: "Lechuga, zanahoria, tomate y pepino con tiritas de pollo empanizado en salsa Buffalo, BBQ o mixta." },
  { id: "ent-papas", categoryId: "entradas", name: "Papas Sazonadas", price: 110, image: IMG_PLAT,
    description: "Ricas papas sazonadas acompañadas de queso amarillo o aderezo ranch." },
  { id: "ent-roka-chicken", categoryId: "entradas", name: "Roka Chicken", price: 185, image: IMG_BONELESS,
    description: "" },
  { id: "ent-verduras-tempura", categoryId: "entradas", name: "Verduras Tempura", price: 150, image: IMG_PLAT,
    description: "Zanahorias, cebolla, calabaza, brócoli y chile morrón. 400gr de verdura." },

  // ===== ROLLOS =====
  { id: "rol-arrachera", categoryId: "rollos", name: "Arrachera Roll (10 pz)", price: 190, image: IMG_ROLL,
    description: "Pepino, aguacate, queso manchego, chile verde, carne de res y por fuera queso phila con tocino." },
  { id: "rol-bomba-camaron", categoryId: "rollos", name: "Bomba Camarón 400gr", price: 190, image: IMG_ROLL2,
    description: "Pepino, aguacate, queso phila, camarón." },
  { id: "rol-bomba-especial", categoryId: "rollos", name: "Bomba Especial 400gr", price: 220, image: IMG_ROLL2,
    description: "Pepino, aguacate, queso phila. Ingrediente a elegir: atún, salmón, ostión o pulpo." },
  { id: "rol-bomba-casa", categoryId: "rollos", name: "Bomba Especialidad de la Casa 400gr", price: 210, image: IMG_ROLL2, tags: ["favorito"],
    description: "" },
  { id: "rol-bomba-veg", categoryId: "rollos", name: "Bomba Vegetariana 400gr", price: 155, image: IMG_ROLL2,
    description: "Pepino, aguacate, queso phila y zanahoria." },
  { id: "rol-bombazo", categoryId: "rollos", name: "Bombazo Sushi 400gr", price: 210, image: IMG_ROLL, tags: ["picante"],
    description: "Pepino, aguacate, queso phila, camarón, surimi, marlin, tocino, chile y aderezo dinamita." },
  { id: "rol-c4", categoryId: "rollos", name: "C-4 Roll (10 pz)", price: 190, image: IMG_ROLL, tags: ["picante"],
    description: "Pepino, aguacate, queso phila, chile serrano, camarón empanizado y tampico." },
  { id: "rol-cali-especial", categoryId: "rollos", name: "California Especial (10 pz)", price: 175, image: IMG_ROLL2,
    description: "Pepino, aguacate, queso phila y ingrediente a elegir: salmón, atún, ostión y/o pulpo." },
  { id: "rol-cali-trad", categoryId: "rollos", name: "California Tradicional (10 pz)", price: 155, image: IMG_ROLL2, tags: ["favorito"],
    description: "Pepino, aguacate, phila y un ingrediente: res, marlin, tocino, pollo, plátano, chile toreado, camarón, surimi o tampico." },
  { id: "rol-cali-veg", categoryId: "rollos", name: "California Vegetariano (10 pz)", price: 120, image: IMG_ROLL2,
    description: "Pepino, aguacate, queso phila y zanahoria." },
  { id: "rol-chalino", categoryId: "rollos", name: "Chalino Roll (10 pz)", price: 190, image: IMG_ROLL, tags: ["picante"],
    description: "Pepino, aguacate, queso phila, surimi y camarón, gratinado con queso manchego y aderezo dinamita." },
  { id: "rol-chicken", categoryId: "rollos", name: "Chicken Roll (10 pz)", price: 190, image: IMG_ROLL,
    description: "Pepino, aguacate, queso manchego, tampico, camarón empanizado y pollo." },
  { id: "rol-chipotle", categoryId: "rollos", name: "Chipotle Roll (10 pz)", price: 190, image: IMG_ROLL, tags: ["picante"],
    description: "Pepino, aguacate, queso phila, camarón y tocino, bañado con crema de chipotle." },
  { id: "rol-cmt", categoryId: "rollos", name: "Cielo, Mar y Tierra Roll (10 pz)", price: 190, image: IMG_ROLL,
    description: "Pepino, aguacate, queso phila, camarón, pollo y res." },
  { id: "rol-cordon", categoryId: "rollos", name: "Cordon Blue (10 pz)", price: 190, image: IMG_ROLL,
    description: "Pepino, aguacate, queso phila, pollo, gratinado con queso manchego y tocino." },
  { id: "rol-cosmo", categoryId: "rollos", name: "Cosmo Roll (10 pz)", price: 190, image: IMG_ROLL,
    description: "Pepino, aguacate, queso phila, camarón por dentro y salmón por fuera." },
  { id: "rol-culichi", categoryId: "rollos", name: "Culichi Roll (10 pz)", price: 190, image: IMG_ROLL, tags: ["picante"],
    description: "Pepino, aguacate, queso phila, tocino, camarón y rajas de chile caribe toreados." },
  { id: "rol-dinamita", categoryId: "rollos", name: "Dinamita Roll (10 pz)", price: 190, image: IMG_ROLL, tags: ["picante", "favorito"],
    description: "Pepino, aguacate, queso phila, camarón, marlin, chile toreado y queso manchego gratinado con aderezo dinamita." },
  { id: "rol-greengo", categoryId: "rollos", name: "Greengo Roll (10 pz)", price: 190, image: IMG_ROLL,
    description: "Vegetales (apio, zanahoria, pepino y aguacate), queso phila, tiritas de pechuga empanizada con aderezo de la casa." },
  { id: "rol-guerrero", categoryId: "rollos", name: "Guerrero Roll (10 pz)", price: 210, image: IMG_ROLL, tags: ["nuevo"],
    description: "Salmón empanizado, aguacate, pepino y doble phila. Coronado con kanikama, camarón y salsa de la casa." },
  { id: "rol-luz-fuego", categoryId: "rollos", name: "Luz y Fuego Roll (10 pz)", price: 190, image: IMG_ROLL,
    description: "Pepino, aguacate, queso phila, marlin, surimi y queso manchego gratinado con tocino." },
  { id: "rol-manchego", categoryId: "rollos", name: "Manchego Roll (10 pz)", price: 190, image: IMG_ROLL,
    description: "Pepino, aguacate, queso phila, tocino, res y gratinado con queso manchego." },
  { id: "rol-mango", categoryId: "rollos", name: "Mango Roll (10 pz)", price: 190, image: IMG_ROLL,
    description: "Pepino, aguacate, pollo y tocino, con queso phila y trozos de piña, cubierto de salsa de mango con chile." },
  { id: "rol-morelos", categoryId: "rollos", name: "Morelos Roll (10 pz)", price: 190, image: IMG_ROLL, tags: ["picante"],
    description: "Pepino, aguacate, res, pollo, deditos de queso manchego, cubierto de queso phila, chiles caribe y verde con tocino." },
  { id: "rol-nevado", categoryId: "rollos", name: "Nevado Roll (10 pz)", price: 190, image: IMG_ROLL,
    description: "Pepino, aguacate, queso phila, surimi, camarón y gratinado con queso manchego o cubierto con phila." },
  { id: "rol-tampico", categoryId: "rollos", name: "Orden de Tampico", price: 45, image: IMG_ROLL,
    description: "" },
  { id: "rol-shushiyto", categoryId: "rollos", name: "Shushiyto Roll (10 pz)", price: 190, image: IMG_ROLL,
    description: "Pepino, aguacate, queso phila, cangrejo empanizado coronado con tampico spicy y camarón empanizado." },
  { id: "rol-sonora", categoryId: "rollos", name: "Sonora Roll (10 pz)", price: 190, image: IMG_ROLL,
    description: "Pepino, aguacate, queso phila, chile verde, pollo, tocino, res, cubierto de aguacate y crema de cilantro." },
  { id: "rol-subarachi", categoryId: "rollos", name: "Subarachi Roll (10 pz)", price: 190, image: IMG_ROLL,
    description: "Pepino, aguacate, queso phila, camarón; por fuera queso phila y tampico." },
  { id: "rol-sushilito", categoryId: "rollos", name: "Sushilito Roll (10 pz)", price: 190, image: IMG_ROLL, tags: ["favorito", "picante"],
    description: "Pepino, aguacate, queso phila, tocino, camarón, chiles toreados y salsa picosa por dentro." },
  { id: "rol-teriyaki", categoryId: "rollos", name: "Teriyaki Roll (10 pz)", price: 180, image: IMG_ROLL,
    description: "Aguacate, queso phila, pepino, pollo y zanahoria con salsa teriyaki y ajonjolí." },
  { id: "rol-tocino", categoryId: "rollos", name: "Tocino Especial (10 pz)", price: 190, image: IMG_ROLL,
    description: "Pepino, aguacate, surimi y camarón empanizados, con queso phila y tocino, cubierto con crema de cilantro." },

  // ===== PLATILLOS =====
  { id: "plat-chich-atun", categoryId: "platillos", name: "Chicharrones de Atún", price: 205, image: IMG_PLAT,
    description: "Trozos de atún fritos sazonados, acompañados de salsa de aceite y semillas con toque cítrico." },
  { id: "plat-gohan", categoryId: "platillos", name: "Gohan", price: 140, image: IMG_PLAT,
    description: "Tazón de arroz blanco (230gr) con queso phila, tampico y furikake." },
  { id: "plat-gohan-esp", categoryId: "platillos", name: "Gohan Especial", price: 195, image: IMG_PLAT,
    description: "Arroz blanco (230gr), queso phila, tampico, res (200gr), pollo (240gr), camarón (10pz) y furikake." },
  { id: "plat-japan", categoryId: "platillos", name: "Japan (1 ingrediente)", price: 195, image: IMG_PLAT, tags: ["picante"],
    description: "Verduras salteadas sobre arroz blanco o frito, bañadas en salsa picosita. Elige: camarón, pollo o res." },
  { id: "plat-misil", categoryId: "platillos", name: "Misil", price: 210, image: IMG_PLAT, tags: ["picante"],
    description: "Chile verde empanizado relleno de queso manchego, res, pollo y tocino." },
  { id: "plat-tepanyaki", categoryId: "platillos", name: "Tepanyaki (1 ingrediente)", price: 195, image: IMG_PLAT,
    description: "Verduras salteadas sobre arroz blanco o frito, salsa de la casa y ajonjolí. Elige: camarón, pollo o res." },
  { id: "plat-teriyaki", categoryId: "platillos", name: "Teriyaki (1 ingrediente)", price: 195, image: IMG_PLAT, tags: ["favorito"],
    description: "Verduras al vapor o salteadas sobre arroz, con salsa teriyaki y ajonjolí. Elige: camarón, pollo o res." },
  { id: "plat-yakimeshi", categoryId: "platillos", name: "Yakimeshi", price: 155, image: IMG_PLAT,
    description: "Arroz frito (230gr) con verduras finamente picadas, queso phila, tampico y aguacate." },
  { id: "plat-yakimeshi-esp", categoryId: "platillos", name: "Yakimeshi Especial", price: 195, image: IMG_PLAT,
    description: "Arroz frito (230gr), verduras, res (200gr), pollo (240gr), tocino y tampico." },
  { id: "plat-chicken-crunch", categoryId: "platillos", name: "Chicken Crunch", price: 200, image: IMG_BONELESS, tags: ["nuevo"],
    description: "Tiras de pollo empanizadas bañadas en salsa naranja-piña, sobre arroz blanco con ajonjolí." },
  { id: "plat-chicken-mongolia", categoryId: "platillos", name: "Chicken Mongolia", price: 210, image: IMG_BONELESS, tags: ["picante"],
    description: "Pollo empanizado, cebolla, pimientos, nuez de la india y salsa Mongolia spicy sobre arroz blanco." },
  { id: "plat-arroz-blanco", categoryId: "platillos", name: "Porción de Arroz Blanco (230gr)", price: 55, image: IMG_PLAT, description: "" },
  { id: "plat-arroz-frito", categoryId: "platillos", name: "Porción de Arroz Frito (230gr)", price: 80, image: IMG_PLAT, description: "" },

  // ===== SOPAS =====
  { id: "sop-udon-veg", categoryId: "sopas", name: "Sopa Udón Vegetariana", price: 150, image: IMG_SOPA,
    description: "Pasta de fideos gruesos con vegetales y hongo shitake. 200gr." },
  { id: "sop-udon-pollo", categoryId: "sopas", name: "Sopa Udón con Pollo", price: 175, image: IMG_SOPA,
    description: "Fideos gruesos con vegetales, hongo shitake y pollo (120gr)." },
  { id: "sop-udon-cam", categoryId: "sopas", name: "Sopa Udón con Camarón", price: 175, image: IMG_SOPA, tags: ["favorito"],
    description: "Fideos gruesos con vegetales, hongo shitake y camarón (6 pz)." },
  { id: "sop-udon-spicy-veg", categoryId: "sopas", name: "Sopa Udón Spicy Vegetariana", price: 155, image: IMG_SOPA, tags: ["picante"],
    description: "Fideos gruesos con vegetales y hongos shitake, sazonada con un toque picosito." },
  { id: "sop-udon-spicy-pollo", categoryId: "sopas", name: "Sopa Udón Spicy con Pollo", price: 180, image: IMG_SOPA, tags: ["picante"],
    description: "Spicy con pollo (120gr), vegetales y hongo shitake." },
  { id: "sop-udon-spicy-cam", categoryId: "sopas", name: "Sopa Udón Spicy con Camarón", price: 180, image: IMG_SOPA, tags: ["picante"],
    description: "Spicy con camarón (6 pz), vegetales y hongo shitake." },

  // ===== KIDS =====
  { id: "kids-nuggets", categoryId: "kids", name: "Nuggets de Pollo (9 pz)", price: 120, image: IMG_KIDS, tags: ["favorito"], description: "" },
  { id: "kids-papas", categoryId: "kids", name: "Papas Fritas (150gr)", price: 75, image: IMG_KIDS, description: "" },

  // ===== BEBIDAS =====
  { id: "beb-agua", categoryId: "bebidas", name: "Agua 330ml", price: 20, image: IMG_BEB, description: "" },
  { id: "beb-lim-frutos", categoryId: "bebidas", name: "Limonada de Frutos Rojos 500ml", price: 75, image: IMG_BEB, tags: ["favorito"], description: "" },
  { id: "beb-lim-frutos-min", categoryId: "bebidas", name: "Limonada Frutos Rojos Mineral 500ml", price: 80, image: IMG_BEB, description: "" },
  { id: "beb-lim-min", categoryId: "bebidas", name: "Limonada Mineral 500ml", price: 50, image: IMG_BEB, description: "" },
  { id: "beb-lim-nat", categoryId: "bebidas", name: "Limonada Natural 500ml", price: 45, image: IMG_BEB, description: "" },
  { id: "beb-refresco", categoryId: "bebidas", name: "Refresco 600ml", price: 45, image: IMG_BEB, description: "" },
  { id: "beb-te-medio", categoryId: "bebidas", name: "Té 500ml", price: 40, image: IMG_BEB, description: "" },
  { id: "beb-te-litro", categoryId: "bebidas", name: "Té 1L", price: 50, image: IMG_BEB, description: "" },
];

export interface Sucursal {
  id: string;
  name: string;
  address: string;
  phone: string;
  whatsapp: string;
  hours: string;
}

export const sucursales: Sucursal[] = [
  { id: "morelos", name: "Morelos",
    address: "Av. José María Morelos y Pavón 1001, esq. Quintana Roo, Col. Cuauhtémoc, Cd. Obregón, Sonora.",
    phone: "644 413 5070", whatsapp: "5216444135070",
    hours: "Lun a Dom · 12:00 PM - 10:00 PM" },
  { id: "guerrero", name: "Guerrero",
    address: "Av. Guerrero, Cd. Obregón, Sonora.",
    phone: "644 000 0000", whatsapp: "5216440000000",
    hours: "Lun a Dom · 12:00 PM - 10:00 PM" },
  { id: "tabasco", name: "Tabasco",
    address: "Calle Tabasco, Cd. Obregón, Sonora.",
    phone: "644 000 0000", whatsapp: "5216440000000",
    hours: "Lun a Dom · 12:00 PM - 10:00 PM" },
  { id: "casablanca", name: "Casa Blanca",
    address: "Casa Blanca, Cd. Obregón, Sonora.",
    phone: "644 000 0000", whatsapp: "5216440000000",
    hours: "Lun a Dom · 12:00 PM - 10:00 PM" },
  { id: "navojoa", name: "Navojoa",
    address: "Calle Morelos entre García Morales y Toledo, Colonia Reforma, Navojoa, Sonora.",
    phone: "642 424 1677", whatsapp: "5216424241677",
    hours: "Lun a Dom · 12:00 PM - 10:00 PM" },
];

export const formatMXN = (n: number) =>
  n.toLocaleString("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 });
