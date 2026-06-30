# Firebase Sushilito Obregon

## Variables

Crear `.env` con:

```bash
VITE_FIREBASE_PROJECT_ID=tu-project-id
VITE_FIREBASE_API_KEY=tu-api-key-web
VITE_ADMIN_PIN=un-pin-privado
```

## Colecciones

La app crea/escribe estas colecciones:

- `clientes`
- `pedidos`
- `comandas`
- `puntos_movimientos`
- `productos`
- `categorias`
- `configuracion`

## Reglas

Publicar el contenido de `firebase.rules`. La comanda queda tolerante por solicitud:

```js
match /comandas/{id} {
  allow read: if true;
  allow create, update: if true;
  allow delete: if false;
}
```

La vigencia de la comanda se valida dentro de `public/comanda.html` usando `expiresAtMillis`; no se bloquea desde reglas.
