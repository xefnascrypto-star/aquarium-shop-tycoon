# Arquitectura v0.7
design.js centraliza productos, precios, perfiles y definiciones de niveles 1–10. requirements combina XP, ventas e hitos; recalcLevel sólo avanza. placementRewarded impide obtener XP repetidamente con Deshacer.

layout-model.js separa catálogo e instancias (id, kind, roomId, x, y, rotation, placed). purchased representa propiedad; owned sólo incluye objetos colocados. Migración acepta layouts 1, 2 y 3, conserva posiciones válidas y deja pendientes los muebles que no caben. La geometría deriva de expansion, no de dimensiones arbitrarias guardadas.

editor.js mantiene borradores y un historial de distribución, nunca de dinero. Comprar no coloca. Confirmar valida; cancelar conserva la compra pendiente. Hueco propone una posición con accesos; necesita confirmación. drawRoom deriva suelo y paredes de la cuadrícula, preservando el arte de scene.js/objects.js.

navigation.js construye obstáculos de huellas colocadas y calcula A* de cuatro vecinos con coste pequeño de giro. Los bordes sur y este son puntos de servicio. visitors.js mantiene cestas, itinerarios, cola y puestos. El conjunto completo visita cada expositor y paga atómicamente. Los turnos asignan hasta dos empleados; los personajes no son obstáculos móviles entre sí. Editar retira visitas sin cobrar y al terminar reinicia desde la puerta.

economy.js valida desbloqueo, saldo, cantidad y volumen antes de descontar. Un envío en curso evita sobreventa de espacio. sellBasket comprueba toda la cesta antes de modificarla; los productos del conjunto aceptado quedan reservados. El anticipo sólo existe sin stock, entrega, saldo suficiente ni deuda previa.

El reloj usa speed compartido para clientes, entregas y salarios. Los visitantes subdividen pasos para conservar colisiones a ×12. No se acumulan ingresos al cerrar u ocultar. Entregas y salarios guardan tiempo restante; visitantes y colas son transitorios.

El catálogo conserva roomId y tipos de futuras habitaciones. Las conexiones entre departamentos requerirán portales explícitos. No hay niveles 11–80, marketing, satisfacción ni monetización implementados.

## Movimiento, interacción y dibujo
layout-model.barriers produce barreras en los bordes e incluye obstáculos estructurales de la sala. La huella de un mueble nunca es un destino de visita: navigation.services devuelve casillas exteriores de sus caras de atención. Cada planificación exige producto, caja y salida conectados.
motion.points redondea giros con una curva dentro de la casilla libre (radio 0,2); motion.travel consume distancia continua y valida el barrido del radio físico (0,28). No se interpola atravesando esquinas ocupadas. Cambios que no alteran el camino, como ampliar la sala, no fuerzan regresos al centro de una casilla.
characters.create/update/remove reciben pies, dirección, fase, distancia recorrida y bocadillo. Pueden sustituirse por otra librería de personajes sin cambiar ventas ni navegación. El balanceo sólo afecta al dibujo. ShopDepth ordena por separación de huellas, no por la esquina más lejana del objeto.

## Variaciones acotadas
moments.js usa tiempo de juego y un único evento opcional. Hay pausa entre oportunidades y se generan sólo en niveles 1–4. No abre diálogos automáticamente.
Un encargo reserva unidades mediante reserved(k, exceptId); sellBasket respeta simultáneamente esa reserva y la del conjunto completo. La reclamación se reinicia al editar o recargar; el cobro valida su ID y sólo puede completarse una vez. Una visita fallida vuelve a intentarse después de una espera; si no se prepara el stock, el encargo caduca sin penalización.
quote aplica una oferta únicamente al producto y proveedor local previstos; se consume después de superar todas las validaciones de order. La recomendación cambia una parte de la demanda, no los precios ni las estadísticas de satisfacción.
