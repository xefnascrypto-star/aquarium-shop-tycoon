// Data for the first playable slice. No levels beyond ten are implemented.
(function(root,factory){const d=factory();if(typeof module==='object'&&module.exports)module.exports=d;else root.ShopDesign=d})(globalThis,()=>{
const products={
betta:{name:'Betta',buy:25,sell:45,vol:0,level:1,display:'betta',icon:'🐟'},
comet:{name:'Cometa',buy:15,sell:30,vol:0,level:1,display:'comet',icon:'🐠'},
food:{name:'Comida básica',buy:20,sell:35,vol:1,level:1,display:'shelf',icon:'▤'},
conditioner:{name:'Acondicionador',buy:30,sell:50,vol:1,level:1,display:'shelf',icon:'◒'},
guppy:{name:'Guppy',buy:18,sell:35,vol:0,level:3,display:'tank3',icon:'🐟'},
platy:{name:'Platy',buy:22,sell:42,vol:0,level:3,display:'tank3',icon:'🐠'},
filter:{name:'Filtro',buy:70,sell:110,vol:2,level:4,display:'shelf',icon:'▥'},
heater:{name:'Calentador',buy:60,sell:95,vol:1,level:4,display:'shelf',icon:'♨'},
light:{name:'Luz',buy:90,sell:140,vol:2,level:4,display:'shelf',icon:'☀'},
siphon:{name:'Sifón',buy:35,sell:60,vol:1,level:4,display:'shelf',icon:'∿'},
thermometer:{name:'Termómetro',buy:15,sell:30,vol:1,level:4,display:'shelf',icon:'♧'},
neon:{name:'Neón',buy:12,sell:25,vol:0,level:6,display:'battery',icon:'🐟'},
molly:{name:'Molly',buy:20,sell:40,vol:0,level:6,display:'battery',icon:'🐠'},
cory:{name:'Corydora',buy:25,sell:50,vol:0,level:6,display:'battery',icon:'🐟'},
ancistrus:{name:'Ancistrus',buy:35,sell:70,vol:0,level:6,display:'battery',icon:'🐟'},
anubias:{name:'Anubias',buy:45,sell:90,vol:1,level:10,display:'plants',investment:'plants',icon:'🌿'},
discus:{name:'Disco',buy:100,sell:190,vol:0,level:10,display:'professional',investment:'professional',icon:'🐠'}
};
const space={initial:{width:16,depth:14},expanded:{width:20,depth:17}};
const recovery={target:15,coinInterval:60,coinAmount:1,reward:10,rewardResourceCeiling:30,rewardCooldown:1800,rewardWindow:3600,rewardLimit:2};
const staffMotion={walkSpeed:1.8,fishSeconds:3,goodsSeconds:1.1,visualScale:1.18};
const upgrades={
microWidth:{name:'Franja lateral',cost:180,level:2,detail:'Una columna adicional de casillas. Precio provisional; compatible con la ampliación grande.'},
microDepth:{name:'Franja del fondo',cost:260,level:3,detail:'Una fila adicional de casillas. Precio provisional; compatible con la ampliación grande.'},
shelf:{name:'Estantería',cost:250,level:2,kind:'shelf',detail:'Expón comida, acondicionador y futuro equipamiento.'},
tank3:{name:'Acuario de 60 L',cost:350,level:3,kind:'tank3',detail:'Un hogar para Guppys y Platys. Tú eliges su sitio.'},
expansion:{name:'Ampliación de la tienda',cost:1200,level:5,detail:'16 × 14 → 20 × 17 casillas. Requiere 25 ventas y un acuario completo. +10 Perlas.'},
tank4:{name:'Cuarto acuario',cost:350,level:5,kind:'tank4',detail:'Otro expositor para Bettas y Cometas. Requiere ampliación.'},
tank5:{name:'Quinto acuario',cost:350,level:5,kind:'tank5',detail:'Otro expositor para Guppys y Platys. Requiere ampliación.'},
shelf2:{name:'Segunda estantería',cost:250,level:5,kind:'shelf2',detail:'Más opciones de distribución. Requiere ampliación.'},
battery:{name:'Batería Agua Dulce I',cost:2000,level:6,kind:'battery',detail:'Neones, Mollys, Corydoras y Ancistrus. Admite ventas en grupos.'},
warehouse:{name:'Almacén I',cost:4000,level:8,detail:'Capacidad 20 → 50 de mercancía.'},
plants:{name:'Plantas I',cost:12000,level:10,kind:'plants',detail:'Abre tu primera exposición de Anubias.'},
professional:{name:'Batería profesional',cost:14000,level:10,kind:'professional',detail:'Empieza con Discos de mayor valor.'},
warehouse2:{name:'Almacén II',cost:11000,level:10,detail:'Capacidad 50 → 100. Requiere Almacén I.'}
};
const employees={
eva:{name:'Eva',role:'Atención ágil',service:3.5,wage:40,detail:'Caja en 3,5 s · 40 monedas/min. Atiende más deprisa.'},
nico:{name:'Nico',role:'Venta cuidada',service:5,wage:30,detail:'Caja en 5 s · 30 monedas/min. Menor coste periódico.'}
};
const kit={betta:1,food:1,conditioner:1,filter:1,heater:1,light:1,siphon:1,thermometer:1};
const levels=[
{level:2,xp:50,sales:5,name:'Un rincón para productos',unlock:'Estantería y proveedor local'},
{level:3,xp:120,sales:8,name:'Tu primer pedido',unlock:'Acuario de 60 L · Guppy · Platy'},
{level:4,xp:220,sales:15,name:'Nuevos habitantes',unlock:'Equipamiento · pedido de acuario completo'},
{level:5,xp:400,sales:25,name:'Una solución completa',unlock:'Ampliación de tienda'},
{level:6,xp:600,sales:35,name:'Espacio para crecer',unlock:'Batería Agua Dulce I · cuatro especies'},
{level:7,xp:850,sales:50,name:'Un pequeño cardumen',unlock:'Proveedor mayorista'},
{level:8,xp:1200,sales:80,name:'Compra con criterio',unlock:'Almacén I · ventas perdidas'},
{level:9,xp:1700,sales:110,name:'Siempre preparados',unlock:'Colas · contratación del segundo empleado'},
{level:10,xp:2200,sales:140,name:'Tu primera gran decisión',unlock:'Plantas I · batería profesional · Almacén II'}
];
return {products,upgrades,employees,kit,levels,space,recovery,staffMotion};
});
