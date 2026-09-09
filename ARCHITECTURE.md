# Arquitectura v0.8.1
design.js centraliza productos, precios, perfiles y definiciones de niveles 1–10. requirements combina XP, ventas e hitos; recalcLevel sólo avanza. placementRewarded impide obtener XP repetidamente con Deshacer.

layout-model.js separa catálogo e instancias (id, kind, roomId, x, y, rotation, placed). purchased representa propiedad; owned sólo incluye objetos colocados. Migración acepta layouts 1, 2 y 3, conserva posiciones válidas y deja pendientes los muebles que no caben. La geometría deriva de expansion, no de dimensiones arbitrarias guardadas.

editor.js mantiene borradores y un historial de distribución, nunca de dinero. Comprar no coloca. Confirmar valida; cancelar conserva la compra pendiente. Hueco propone una posición con accesos; necesita confirmación. drawRoom deriva suelo y paredes de la cuadrícula, preservando el arte de scene.js/objects.js.

navigation.js construye obstáculos de huellas colocadas y calcula A* de cuatro vecinos con coste pequeño de giro. Los bordes sur y este son puntos de servicio. visitors.js mantiene cestas, itinerarios, cola y puestos. El conjunto completo visita cada expositor y paga atómicamente. Los turnos asignan hasta dos empleados; los personajes no son obstáculos móviles entre sí. Editar retira visitas sin cobrar y al terminar reinicia desde la puerta.

economy.js valida desbloqueo, saldo, cantidad y volumen antes de descontar. Los pedidos en tránsito reservan su volumen, evitando sobreventa de espacio sin limitar la concurrencia. sellBasket comprueba toda la cesta antes de modificarla; los productos del conjunto aceptado quedan reservados. El anticipo sólo existe sin stock, entrega, saldo suficiente ni deuda previa.

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

## Identidad y presentación v0.8
identity.js define state.identity = { version: 1, name, color, icon, shape, locale }. Su versión es independiente del esquema económico 6 y del layout 3 para evitar repetir migraciones económicas. normalize valida opciones de catálogo, limita el nombre y elimina caracteres de control; mark escapa contenido antes de generar SVG. El mismo valor y adaptador pueden alimentar futuras señales, vehículos o embalajes sin añadirlos a esta versión.
identity-ui.js crea una identidad antes de la primera llegada. El reloj y el guardado automático no avanzan sin identidad. Las partidas existentes sin ella reciben un valor por defecto sin sustituir dinero, stock, empleados, pedidos ni distribución. Personalizar desde Ajustes pausa los relojes, edita un borrador y permite cancelar; el guardado contiene siempre la identidad confirmada.
i18n.js contiene las claves nuevas en es/en y sustituciones de parámetros. El selector describe su alcance: identidad y bocadillos; la interfaz anterior de gestión conserva sus cadenas españolas.
fish-art.js contiene catálogo visual, siluetas y composición por expositor. paint sólo reconstruye el grupo de peces cuando cambia el conjunto de especies con stock. La animación es visual y respeta movimiento reducido; no escribe cantidades, rutas ni ventas.
characters.js mantiene create/update/remove. profile combina módulos visuales con una semilla de apariencia independiente de Math.random de la economía. Los pies y colisiones permanecen bajo visitors/motion; piernas, cabeza, brazos y bolsa sólo alteran el dibujo. La bolsa depende del resultado de una compra confirmada, no de haber llegado al mostrador.

## Pedidos y reservas v0.8.1
supplier-orders.js es un módulo puro. providers centraliza nivel, mínimo, factor de precio y duración; productRules permite excepciones por producto sin cambiar el ciclo de vida. quote incorpora el descuento de la oportunidad en el momento de compra; el pedido conserva ese importe y duración aunque cambie el proveedor seleccionado.
state.ordersVersion=1 y state.orders sustituyen state.delivery sin cambiar el esquema económico 6. Cada pedido tiene id, k, q, cost, supplier, orderedAt, duration, remaining, status y deliveredAt. orderSerial se guarda para no reutilizar IDs.
orderReason es compartido por la interfaz y la compra: valida producto, proveedor, mínimo, saldo y used()+reservedSpace()+volumen solicitado. Sólo tras superar todas las condiciones se descuenta dinero, reserva la mercancía y consume una oferta. No hay límite de un pedido ni suma de plazos.
advance resta el mismo dt a cada pedido activo. Los vencidos pasan a delivered antes de aplicar efectos; deliveryTick acredita stock, recepción por proveedor y XP una vez, emite deliveryreceived con cada registro y guarda el lote atómicamente en localStorage. Se conservan hasta 50 entregas terminadas para diagnóstico y todos los pedidos activos, sin límite.
remaining es autoritativo y se conserva al cerrar. orderedAt/deliveredAt son fechas de la sesión; no se usa una hora de llegada de pared para consumir progreso offline. migrate convierte el pedido legacy sólo si no existe el nuevo array; un coste histórico ausente queda null, no se inventa ni se cobra.
space/reserved encapsulan capacidad: hoy únicamente volumen de almacén. La futura capacidad de stock vivo deberá añadirse como otro recurso, no restar plazas ficticias del almacén.
