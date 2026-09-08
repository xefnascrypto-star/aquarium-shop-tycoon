# Aquarium Shop Tycoon · v0.5
Juego de gestión isométrico/cozy, en español y adaptable a móvil.

## Jugar
https://xefnascrypto-star.github.io/aquarium-shop-tycoon/

Toca acuarios y estantería para consultar stock y pedir productos. Arrastra la cámara, pellizca o usa +/−. Editar permite seleccionar, mover, girar, confirmar, cancelar y deshacer muebles. Posiciones y orientaciones se guardan con la partida anterior.

## Circulación real
Hasta tres clientes entran por la puerta, buscan un producto disponible, caminan entre muebles, lo miran durante 2,5 segundos, van a caja, pagan y salen. Las rutas usan casillas contiguas sin diagonales. Acuarios y muebles adquiridos son obstáculos según su posición y orientación.

La tienda comprueba el acceso a productos, caja y almacén. El aviso permite localizar el objeto y abrir su edición; la previsualización muestra cómo afecta cada movimiento. Una distribución físicamente válida puede guardarse aunque bloquee el acceso. Sin recorrido completo hasta el producto, caja y salida, no hay compra.

Las nuevas visitas se intentan cada ocho segundos; el pago depende del recorrido real, con un mínimo de ocho segundos entre ventas. El stock se descuenta sólo en caja: si se agotó el producto elegido, el cliente sale sin comprar otro automáticamente. Editar interrumpe las visitas pendientes y las reinicia por la puerta al terminar; las entregas continúan.

## Economía conservada
500 monedas iniciales; Bettas 25/45, Cometas 15/30, comida 20/35 (compra/venta); pedidos de 30 segundos; niveles 1–10; estantería 250; tercer acuario 350; almacén 4.000 en nivel 8; capacidad 20→50. Se conserva localStorage aquariumShopV01 y el bonus offline provisional (máximo cuatro horas), independiente de la simulación de recorridos.

## Edición
Cuadrícula de 12 × 12, dos orientaciones de suelo (0° y 90°), arrastre o flechas, confirmación y cancelación. Deshacer recupera hasta 30 cambios de la sesión. No se permite ocupar la entrada, superponer muebles ni salir de la sala. Las mejoras buscan espacio libre y evitan las casillas donde están caminando clientes.

## Arquitectura y alcance
Sin dependencias de producción ni compilación; rutas relativas compatibles con GitHub Pages desde main, raíz. layout-model.js define catálogo, habitaciones, huellas y migración; objects.js conserva el arte SVG; editor.js gestiona cambios; navigation.js calcula caminos y acceso; visitors.js ejecuta visitas; circulation-ui.js presenta avisos. economy.js mantiene precios, pedidos y progreso.

Los visitantes son transitorios y no se guardan compras pendientes. La navegación está separada por habitación, preparada para ampliar destinos y añadir conexiones explícitas entre salas. Todavía no hay colas, satisfacción, popularidad, nuevas salas ni departamentos. Varios visitantes pueden compartir una casilla.

## Pruebas
Instala dependencias con npm install; ejecuta npm run preview y, en otro terminal, npm test. Playwright usa Microsoft Edge instalado.
Las pruebas cubren rutas y obstáculos, ausencia de diagonales, orientación, inaccesibilidad y reapertura, posición real dibujada de clientes, compra después de mirar y llegar a caja, última unidad, editor, migraciones, economía, persistencia y anchos 320/390/768/1280.
