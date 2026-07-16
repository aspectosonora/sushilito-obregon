# Firebase Sushilito Obregon

## Variables

Crear `.env` con:

```bash
VITE_FIREBASE_PROJECT_ID=tu-project-id
VITE_FIREBASE_API_KEY=tu-api-key-web
VITE_FIREBASE_AUTH_DOMAIN=tu-project-id.firebaseapp.com
VITE_ADMIN_PIN=un-pin-privado
VITE_TRANSFER_BANK_INFO=Datos bancarios o instrucciones de transferencia
VITE_TRANSFER_IMAGE_URL=https://...
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

## Auth social

En Firebase Console > Authentication > Sign-in method habilitar:

- Google.
- Apple (`apple.com`): requiere Service ID, Team ID, Key ID y private key de Apple Developer.
- Microsoft/Outlook (`microsoft.com`): requiere Application/Client ID y Client Secret de Azure.

Agregar dominios autorizados:

- `sushilitosmenu.com`
- `www.sushilitosmenu.com`
- el dominio de preview de Vercel si se va a probar ahi.

El codigo ya prepara los botones de Google, Apple y Outlook. Si un proveedor no esta habilitado o le faltan credenciales, el login falla en consola pero no bloquea pedidos ni WhatsApp.

## Transferencia

Si la sucursal entrega datos bancarios o imagen/QR, configurar:

- `VITE_TRANSFER_BANK_INFO`
- `VITE_TRANSFER_IMAGE_URL`

Estos datos salen en WhatsApp, pedido Firestore y comanda. Si no se configuran, el sistema muestra "Datos por confirmar" y el pedido sigue funcionando.
