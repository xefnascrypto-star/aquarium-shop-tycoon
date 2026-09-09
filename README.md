# Aquarium Shop Tycoon · v0.7
Demo cozy/isométrica de niveles 1–10. Jugar: https://xefnascrypto-star.github.io/aquarium-shop-tycoon/

## Recorrido jugable
Empieza con 500 monedas, dos acuarios, mostrador, stock gratuito y capacidad 20. Comida y acondicionador se exponen inicialmente en el mostrador.
- Nivel 2: estantería 250, proveedor local y primer pedido.
- Nivel 3: acuario de 60 L 350, Guppy y Platy.
- Nivel 4: filtro, calentador, luz, sifón y termómetro; pedido de acuario completo.
- Nivel 5: ampliación 1.200, de 14 × 13 a 18 × 16 casillas; exige 25 ventas y un conjunto completo, concede 10 Perlas. Cuarto/quinto acuario y segunda estantería opcionales.
- Nivel 6: batería Agua Dulce I 2.000; Neón, Molly, Corydora y Ancistrus, con ventas en grupos.
- Nivel 7: competencia entre proveedor local (precio base, 30 s, sin mínimo) y mayorista (aproximadamente 15% menos, 90 s, mínimo 10 del mismo producto). Lotes 1, 5, 10 o 20.
- Nivel 8: compras perdidas por stock/acceso y Almacén I 4.000, capacidad 50.
- Nivel 9: colas, dos puestos y contratación 1.500. Eva: atención 3,5 s, salario 40/min; Nico: 5 s, 30/min. Dependiente inicial: 6 s y sin salario.
- Nivel 10: Plantas I 12.000, batería profesional 14.000 o Almacén II 11.000 (capacidad 100). Elegir no bloquea las demás. Las dos exposiciones introducen Anubias y Discos, respectivamente.

Los ascensos combinan XP, ventas mínimas e hitos comerciales. Llegar al nivel 10 exige además contratar, pagar un salario y reservar 12.000 monedas. El saldo no se ajusta artificialmente; completar tarde otros hitos puede dar una reserva mayor.
Todos los precios, tiempos y cantidades son provisionales. No se implementan niveles 11–80 ni monetización.

## Editor y circulación
Cada mueble comprado queda pendiente hasta confirmar su colocación. Cancelar y recargar conservan la compra. Deshacer restaura la distribución sin devolver dinero ni repetir XP. Hueco sugiere una posición con acceso, que el jugador debe confirmar.
La ampliación modifica físicamente suelo, paredes y cuadrícula. Los clientes caminan entre obstáculos, visitan expositores, esperan atención, pagan y salen. El editor avisa de zonas inaccesibles.
El pedido completo reserva sus unidades, visita los distintos expositores y cobra toda la cesta de forma atómica. Puede repetirse desde Actividad/mostrador.
Desde nivel 8, una cuarta parte de los clientes intenta comprar un producto concreto, incluso agotado; los demás prefieren lo disponible.
Los visitantes pueden compartir casillas mientras caminan: la cola asigna turnos y puestos, pero todavía no hay colisión entre personas.

## Tiempo y guardado
Partidas nuevas a ritmo ×4; Ajustes permite ×1, ×4 o ×12. Acelera clientes, entregas y salarios por igual, sin regalar progreso. Los tiempos se muestran en segundos de juego.
Al ocultar/cerrar se pausa la simulación. Editar pausa visitas y salarios, mientras continúan entregas. Sin fondos para un salario, el refuerzo espera al siguiente pago posible.
Un Cometa adelantado por el proveedor, con deuda de 15 a devolver en la siguiente venta, evita quedar sin forma de reponer cuando no queda stock, entrega ni saldo suficiente.

Se conserva localStorage aquariumShopV01. Las partidas antiguas migran preservando economía y colocaciones válidas. Esquema 6 y layout versión 3 guardan posiciones, orientación, compras pendientes, pedidos y empleados. El bonus offline provisional anterior se sustituye por pausa real.

## Desarrollo y pruebas
Sin dependencias de producción ni compilación. GitHub Pages: main, raíz; recursos relativos versionados.
Instala dependencias con npm install. Inicia npm run preview y, en otro terminal, npm test. Playwright utiliza Microsoft Edge.
- model.test.cjs: catálogo, huellas, BFS, pendientes, migraciones y ampliación.
- slice.test.cjs: partida nueva completa sin fijar saldo, nivel o XP; clientes físicos, pedidos, editor, contratación e inversión.
- safeguards.test.cjs: idempotencia, reservas, capacidad, salarios, deshacer y accesos bloqueados.

playthrough-v06.json conserva el informe de la versión anterior; playthrough-v07.json registra la regresión completa de esta versión. Pruebas responsive a 320/390/768/1280. El balance sigue pendiente de pruebas con jugadores.

## Pulido v0.7
El local inicial pasa de 144 a 182 casillas (14 × 13): +26,4% de superficie. Las partidas antiguas reciben el espacio adicional sin mover sus muebles válidos. La ampliación comprada sigue siendo de 18 × 16.
Los límites de la habitación actúan como paredes; el modelo admite también obstáculos interiores. A* evita zigzags innecesarios. Las interacciones están fuera de la huella del mueble y aparecen como puntos azules al seleccionarlo en el editor.
El personaje tiene un radio físico de 0,28 casillas. Los giros se redondean dentro de casillas libres y el movimiento conserva la distancia sobrante de cada paso; la actualización visual sigue los fotogramas del navegador. Una comprobación de recorrido bloquea cualquier segmento inválido. El orden de dibujo compara las huellas, corrigiendo la apariencia de estar dentro de un acuario al situarse delante.
Desde el comienzo algunas visitas buscan una especie concreta. Si no encuentran acceso a su expositor, se marchan; las visitas sin preferencia pueden elegir otro producto accesible.
En niveles 1–4 aparecen, de forma espaciada y sin ventanas modales:
- Un vecino que pide dos peces: reservar stock y atenderlo físicamente o rechazarlo sin penalización.
- Una oferta local del 20%, de un solo uso y con 90 segundos de juego para aprovecharla.
- Una recomendación de Betta o Cometa que influye brevemente en las consultas de los visitantes.

Encargos, ofertas y decisiones se guardan con la partida. No hay nuevos niveles, monedas ni grandes sistemas. Las ventas mantienen el efecto de monedas; ventas y pérdidas rutinarias quedan en el registro y los bocadillos, sin encadenar avisos flotantes.
characters.js es un adaptador sustituible (crear, actualizar pose y retirar personaje). motion.js contiene la locomoción independiente del arte. La animación provisional añade orientación y una oscilación leve al caminar, respetando la preferencia de movimiento reducido.
polish-model.test.cjs y polish.test.cjs prueban tres distribuciones distintas de tres acuarios, rotaciones, pasos estrechos, interacción, profundidad, paredes y un pasillo bloqueado/reabierto. polish-v07-report.json contiene las comprobaciones del navegador. moments.test.cjs verifica reservas, cobro real, persistencia, descuentos, caducidad y coexistencia con el pedido completo.
