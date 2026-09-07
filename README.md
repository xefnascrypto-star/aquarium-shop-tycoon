# Aquarium Shop Tycoon · v0.2
Juego de gestión isométrico/cozy, en español y adaptable a móvil.
## Jugar
Abre https://xefnascrypto-star.github.io/aquarium-shop-tycoon/
Toca los acuarios y la estantería para consultar stock y pedir productos; el mostrador, el dependiente y los clientes muestran actividad. Arrastra para mover la cámara, pellizca o usa +/− para acercar. Los objetos también funcionan con teclado.
## Economía conservada de v0.1
500 monedas iniciales; Bettas 25/45, Cometas 15/30, comida 20/35 (compra/venta); ventas cada 8 segundos; pedidos de 30 segundos; niveles 1–10; estantería 250; tercer acuario 350; almacén 4.000 en nivel 8; capacidad 20→50. Se conserva la clave localStorage aquariumShopV01 y el bonus offline provisional (máximo 4 horas). Las mejoras ahora impiden compras duplicadas y se guardan inmediatamente.
Los visitantes son una representación animada del negocio. No hay simulación individual de colas. La economía sigue siendo provisional.
## Archivos
index.html: interfaz. style.css: presentación responsive. scene.js: escenario SVG original. economy.js: reglas v0.1. ui.js: interacción y cámara.
Sin dependencias de producción ni proceso de compilación. Rutas relativas compatibles con GitHub Pages desde main, raíz.
## Pruebas
Instala las dependencias con npm install; ejecuta npm run preview y, en otro terminal, npm test. Las pruebas usan Playwright con Microsoft Edge instalado.
Verificación: ventas, niveles, pedidos, persistencia, bonus offline, bloqueos de mejoras, capacidad, menús, teclado, zoom y anchos 320/390/768/1280.

