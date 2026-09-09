# Arquitectura v0.6
design.js centraliza productos, precios, perfiles y definiciones de niveles 1–10. requirements combina XP, ventas e hitos; recalcLevel sólo avanza. placementRewarded impide obtener XP repetidamente con Deshacer.

layout-model.js separa catálogo e instancias (id, kind, roomId, x, y, rotation, placed). purchased representa propiedad; owned sólo incluye objetos colocados. Migración acepta layouts 1 y 2, conserva posiciones válidas y deja pendientes los muebles que no caben. La geometría deriva de expansion, no de dimensiones arbitrarias guardadas.

editor.js mantiene borradores y un historial de distribución, nunca de dinero. Comprar no coloca. Confirmar valida; cancelar conserva la compra pendiente. Hueco propone una posición con accesos; necesita confirmación. drawRoom deriva suelo y paredes de la cuadrícula, preservando el arte de scene.js/objects.js.

navigation.js construye obstáculos de huellas colocadas y calcula BFS de cuatro vecinos. Los bordes sur y este son puntos de servicio. visitors.js mantiene cestas, itinerarios, cola y puestos. El conjunto completo visita cada expositor y paga atómicamente. Los turnos asignan hasta dos empleados; los personajes no son obstáculos móviles entre sí. Editar retira visitas sin cobrar y al terminar reinicia desde la puerta.

economy.js valida desbloqueo, saldo, cantidad y volumen antes de descontar. Un envío en curso evita sobreventa de espacio. sellBasket comprueba toda la cesta antes de modificarla; los productos del conjunto aceptado quedan reservados. El anticipo sólo existe sin stock, entrega, saldo suficiente ni deuda previa.

El reloj usa speed compartido para clientes, entregas y salarios. Los visitantes subdividen pasos para conservar colisiones a ×12. No se acumulan ingresos al cerrar u ocultar. Entregas y salarios guardan tiempo restante; visitantes y colas son transitorios.

El catálogo conserva roomId y tipos de futuras habitaciones. Las conexiones entre departamentos requerirán portales explícitos. No hay niveles 11–80, marketing, satisfacción ni monetización implementados.
