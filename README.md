# Aquarium Shop Tycoon · v0.4
Juego de gestión isométrico/cozy, en español y adaptable a móvil.
## Jugar
Abre https://xefnascrypto-star.github.io/aquarium-shop-tycoon/
Toca los acuarios y la estantería para consultar stock y pedir productos; el mostrador, el dependiente y los clientes muestran actividad. Arrastra para mover la cámara, pellizca o usa +/− para acercar. Los objetos también funcionan con teclado.
## Economía conservada de v0.1
500 monedas iniciales; Bettas 25/45, Cometas 15/30, comida 20/35 (compra/venta); ventas cada 8 segundos; pedidos de 30 segundos; niveles 1–10; estantería 250; tercer acuario 350; almacén 4.000 en nivel 8; capacidad 20→50. Se conserva la clave localStorage aquariumShopV01 y el bonus offline provisional (máximo 4 horas). Las mejoras ahora impiden compras duplicadas y se guardan inmediatamente.
Los visitantes siguen un recorrido conectado a la atención en caja. La economía sigue siendo provisional.
## Archivos
index.html: interfaz. style.css: presentación responsive. scene.js: escenario SVG original. economy.js: reglas v0.1. ui.js: interacción y cámara. visitors.js: recorridos y atención en caja.
Sin dependencias de producción ni proceso de compilación. Rutas relativas compatibles con GitHub Pages desde main, raíz.
## Pruebas
Instala las dependencias con npm install; ejecuta npm run preview y, en otro terminal, npm test. Las pruebas usan Playwright con Microsoft Edge instalado.
Verificación: ventas, niveles, pedidos, persistencia, bonus offline, bloqueos de mejoras, capacidad, menús, teclado, zoom y anchos 320/390/768/1280.


## v0.3 · Primeros pasos
Recorrido de seis objetivos sin recompensas monetarias: primera venta, recibir un pedido, estantería, tercer acuario, nivel 8 y almacén. El progreso se deriva de la partida existente; las partidas antiguas con estantería superan el paso de reabastecimiento. Contador de ventas hacia el próximo nivel y aviso visible de stock/entrega. Pedidos de 1 o 5 unidades al mismo precio unitario. No cambia la economía base.

## v0.4 · Clientes y caja
Cada ocho segundos se atiende a un visitante real del escenario. Entra, mira un producto disponible, se acerca al mostrador y sale después del resultado. La moneda aparece en el pago; sin stock no hay ingreso. Toca al visitante para consultar su estado. El movimiento reducido conserva las compras sin desplazamientos animados. Se conserva el intervalo y el precio de venta, la clave de guardado y el bonus offline anterior. Los visitantes son transitorios: al recargar empieza una nueva visita y no se repiten cobros pendientes. Los recorridos usan puntos fijos; aún no hay búsqueda de caminos ni colas complejas.

## Edición de tienda (v0.4)
Editar abre una cuadrícula isométrica de 12 × 12. Toca o mantén pulsado un objeto; arrástralo, toca otra casilla o usa las cuatro flechas. Girar intercambia las dos orientaciones de suelo (0° y 90°). Confirmar guarda; Cancelar descarta la propuesta; Deshacer recupera hasta 30 cambios confirmados durante esta sesión. Terminar descarta una propuesta pendiente. Las ventas se pausan al editar; las entregas ya pagadas continúan llegando.
La posición, habitación y orientación de cada instancia se guardan en state.layout (versión 1) junto a la partida. Las partidas anteriores reciben una distribución inicial sin perder economía. No se permite ocupar la entrada, salir de la sala ni superponer huellas. El tercer acuario busca espacio libre al comprarse; si no cabe, no se cobra. La selección de objetos y la edición funcionan también por teclado.
layout-model.js define catálogo, huellas, habitaciones y validación sin DOM; objects.js adapta los mismos dibujos SVG al modelo; editor.js gestiona borradores y deshacer. Los tipos de futuras salas están declarados (agua dulce, plantas, marino, Reef, almacén, taller, Pond/Koi); desbloquear salas requerirá añadir su geometría y reglas explícitas, sin cambiar los IDs de los muebles existentes. Las rutas de visitantes son visuales y todavía no calculan colisiones con muebles ni penalizan distribuciones.
