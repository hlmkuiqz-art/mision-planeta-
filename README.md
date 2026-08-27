# Mision Planeta

Sitio estatico para la experiencia de ciencia ficcion **Mision Planeta / Santo Domingo**.

## Ejecutar localmente

```bash
python3 -m http.server 4173
```

Abre `http://localhost:4173`.

La primera visita debe hacerse con Internet para que el navegador instale la PWA. Despues puedes abrirla desde el menu de aplicaciones del navegador sin conexion. Los archivos de video elegidos en la sesion se reproducen localmente; Stripe necesita Internet.

## Activar cobros reales

Los botones de compra estan preparados con Stripe Checkout, pero actualmente apuntan a los enlaces `test_` del prototipo. Crea los productos en modo Live en Stripe y reemplaza ambos `href` en `index.html` por los enlaces `buy.stripe.com/live_...` correspondientes antes de publicar.
