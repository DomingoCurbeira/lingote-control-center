export interface ProductoMenu {
  id: string;
  nombre: string;
  precio: number;
  desc?: string;
  descripcion?: string;
  imagen?: string;
  alergenos?: string[];
  disponible: boolean;
  personalizable?: boolean;
  ingredientesBase?: string[];
  formatoRetail?: boolean;
  vinculoIndividual?: { categoria: string; nombre: string };
  vinculoCatering?: boolean;
  proximamenteCatering?: boolean;
  activo?: boolean;
  apodo?: string;
}

export interface Promocion extends ProductoMenu {
  precioAnterior?: number;
  ahorro?: number;
}

export const MENU_LINGOTES: ProductoMenu[] = [
  {
    id: "lin-5",
    nombre: "Lingote Supremo",
    apodo: '"La Bestia"',
    precio: 4000,
    descripcion: "La experiencia definitiva de fusión. Un festín donde no falta nada: pinto, 100g de cerdo mechado, aguacate y tortilla. (Añade el toque final con un extra de salsa por ₡500).",
    imagen: "supremo.webp",
    ingredientesBase: ["Tortilla", "Pinto", "Cerdo", "Aguacate"],
    alergenos: ["🥚"],
    disponible: true,
    personalizable: false,
    proximamenteCatering: true
  },
  {
    id: "lin-soberano",
    nombre: "Lingote Soberano",
    apodo: '"El Tata"',
    precio: 3500,
    descripcion: "La joya de la corona. Nuestra tortilla artesanal elevada al máximo nivel con frijoles arreglados, cerdo mechado al vino blanco, pico de gallo y el toque de oro del aguacate nacional.",
    imagen: "soberano.webp",
    ingredientesBase: ["Tortilla", "Cerdo Mechado", "Frijol Arreglado", "Aguacate"],
    alergenos: ["🥚", "🍷"],
    disponible: true,
    personalizable: false,
    proximamenteCatering: true
  },
  {
    id: "lin-3",
    nombre: "Lingote Patrón",
    apodo: '"El Cacique"',
    precio: 3000,
    descripcion: "Para los que mandan en la mesa. Un lingote imponente cargado con 100g de cerdo mechado a fuego lento, aguacate nacional y cebolla encurtida. (Personalízalo con tu salsa favorita por ₡500).",
    imagen: "patron.webp",
    ingredientesBase: ["Tortilla de Patatas", "Cerdo Mechado", "Aguacate"],
    alergenos: ["🥚"],
    disponible: true,
    personalizable: false,
    proximamenteCatering: true
  },
  {
    id: "lin-1",
    nombre: "Lingote clásico",
    apodo: '"El Machillo"',
    precio: 1500,
    descripcion: "La esencia de la tradición española. Nuestra tortilla artesanal, jugosa y dorada, servida con pan artesano. (Añade tus extras favoritos por ₡500).",
    imagen: "clasico.webp",
    ingredientesBase: ["Tortilla de Patatas", "Pan Artesano"],
    alergenos: ["🥚", "🌽"],
    disponible: true,
    personalizable: false,
    vinculoCatering: true
  },
  {
    id: "lin-2",
    nombre: "Lingote Tico",
    apodo: '"El Pintico"',
    precio: 2000,
    descripcion: "El encuentro de dos mundos. El alma de nuestra tortilla española se abraza al sabor criollo del gallo pinto y la dulzura del plátano maduro. (Servido al natural, añade natilla por ₡500).",
    imagen: "tico.webp",
    ingredientesBase: ["Tortilla de Patatas", "Gallo Pinto", "Maduro"],
    alergenos: ["🥚"],
    disponible: true,
    personalizable: false,
    vinculoCatering: true
  },
  {
    id: "lin-6",
    nombre: "Bocata Español",
    precio: 2500,
    descripcion: "Nuestra tortilla artesanal jugosa en pan de baguette artesanal. ¡Incluye una salsa a elegir (Alioli o Natilla) para la experiencia perfecta!",
    imagen: "bocata.webp",
    ingredientesBase: ["Tortilla de Patatas", "Pan de Baguette", "Salsa incluida"],
    alergenos: ["🥚", "🌽"],
    disponible: true,
    personalizable: false 
  }
];

export const MENU_POSTRES: ProductoMenu[] = [
  { 
    id: "pos-31", 
    nombre: "Tarta al Revés de Maduro con Queso",
    apodo: '"La Chineada"',
    precio: 3000,
    desc: "Nuestra corona dulce: Tarta horneada densa y cremosa con queso, y una capa invertida de plátano maduro punto miel caramelizado.", 
    imagen: "tarta.webp", 
    alergenos: ["🥛", "🥚"],
    disponible: true,
    activo: true,
    vinculoCatering: true
  },
  { 
    id: "pos-32", 
    nombre: "Leche Frita con Sopa Fría de Tres Leches",
    apodo: '"El Goloso"',
    precio: 3000,
    desc: "Dados de crema pastelera fritos sumergidos en una sopa fría de tres leches y nevado con Leche Pinito.", 
    imagen: "leche.webp", 
    alergenos: ["🥛", "🥚", "🌾"],
    activo: true,
    disponible: true
  },
  { 
    id: "pos-30", 
    nombre: "La Torrijona", 
    precio: 2500, 
    desc: "Dona de azúcar empapada en tres leches, pasada por huevo y frita al estilo torrija. Servida con helado de vainilla, hilos de dulce de leche y leche Pinito.", 
    imagen: "torrijona.webp", 
    alergenos: ["🥛", "🥚"], 
    disponible: false,
    activo: false
  }
];

export const MENU_PROMOCIONES: Promocion[] = [
  {
    id: 'promoExpress',
    nombre: 'EL COMBO BOCATA ⚡',
    precio: 3500,
    precioAnterior: 4100,
    ahorro: 600,
    desc: 'La opción más rápida: 1 Bocata Español (con salsa) + 1 Bebida Natural.',
    disponible: true,
  },
  {
    id: 'duoSoberano',
    nombre: 'EL DÚO SOBERANO',
    precio: 5500,
    precioAnterior: 6500,
    ahorro: 1000,
    desc: 'Sabor local: 1 Lingote Soberano + 1 Postre.',
    disponible: true,
  },
  {
    id: 'promoGolosa',
    nombre: 'LA TRILOGIA',
    precio: 6000,
    precioAnterior: 6600,
    ahorro: 600,
    desc: 'Menú completo: 1 Lingote tico + 1 Bebida + 1 Postre. (Salsa se vende por separado).',
    disponible: true,
  },
  {
    id: 'promoSolo',
    nombre: 'EL MENU DEL PATRÓN',
    precio: 7000,
    precioAnterior: 7600,
    ahorro: 600,
    desc: 'Para estómagos valientes: 1 Lingote Patrón + 1 Bebida + 1 Postre.',
    disponible: true,
  },
  {
    id: 'PromoSupremoIndividual',
    nombre: 'COMBO SUPREMO XL',
    precio: 7500,
    precioAnterior: 8600,
    ahorro: 1100,
    desc: 'La experiencia total para uno: 1 Lingote Supremo + 1 Bebida + 1 Postre.',
    disponible: true,
  },
  {
    id: 'promoBanqueteTres',
    nombre: 'EL BANQUETE REAL',
    precio: 12000,
    precioAnterior: 15500,
    ahorro: 3500,
    desc: 'Para compartir en grande: 2 Lingotes Supremos + 2 Postres + 1 Lingote Clásico ¡GRATIS! (Bebidas se venden por separado).',
    disponible: true,
  },
  {
    id: 'promoLaParejita',
    nombre: 'LA PAREJITA',
    precio: 8000,
    precioAnterior: 9400,
    ahorro: 1400,
    desc: 'Hecho para compartir: 2 Lingotes Soberanos + 2 Salsas artesanales + 1 Fresco de Cas de 16 oz ¡GRATIS! (Bebida adicional se vende por separado).',
    disponible: true,
  }
];

export const MENU_BEBIDAS: ProductoMenu[] = [
  { 
    id: "beb-1", 
    nombre: "Natural de Temporada", 
    precio: 1400, 
    desc: "Fresco 100% Natural (16oz).", 
    imagen: "cas.webp" ,
    disponible: true
  },
  { 
    id: "beb-2", 
    nombre: "Mora en Leche", 
    precio: 1600, 
    desc: "Cremosa y dulce.", 
    imagen: "mora.webp", 
    alergenos: ["🥛"],
    disponible: true 
  },
  { 
    id: "beb-3", 
    nombre: "Chocolate", 
    precio: 1600, 
    desc: "Caliente", 
    imagen: "chocolate.webp", 
    alergenos: ["🥛"] ,
    disponible: true
  },
  { 
    id: "beb-4", 
    nombre: "Agua Embotellada", 
    precio: 800, 
    desc: "Fría (500ml).", 
    imagen: "agua.webp" ,
    disponible: true
  },
];

export interface Horario {
  abierto: string; // HH:mm
  cerrado: string; // HH:mm
  cerradoTodoElDia: boolean;
}

export const HORARIO_LOCAL: Record<string, Horario> = {
  lunes: { abierto: "10:00", cerrado: "16:00", cerradoTodoElDia: true },
  martes: { abierto: "10:00", cerrado: "20:00", cerradoTodoElDia: true },
  miercoles: { abierto: "10:00", cerrado: "16:00", cerradoTodoElDia: true },
  jueves: { abierto: "10:00", cerrado: "20:00", cerradoTodoElDia: true },
  viernes: { abierto: "10:00", cerrado: "16:00", cerradoTodoElDia: true },
  sabado: { abierto: "10:00", cerrado: "16:00", cerradoTodoElDia: true },
  domingo: { abierto: "10:00", cerrado: "18:00", cerradoTodoElDia: true },
};

export const MENU_SALSAS: ProductoMenu[] = [
  { 
    id: "sal-240-chipotle", 
    nombre: "Alioli Chipotle Asado (240ml)", 
    precio: 3500, 
    desc: "Frasco gourmet para llevar. Nuestra receta de autor con chipotle asado y balsámico.", 
    disponible: true,
    imagen: 'caribenha.webp',
    formatoRetail: true
  },
  { 
    id: "sal-240-caribena", 
    nombre: "Salsa Caribeña (240ml)", 
    precio: 3500, 
    desc: "Frasco gourmet para llevar. El balance perfecto entre coco y chile panameño.", 
    disponible: true,
    imagen: 'chipotle.webp',
    formatoRetail: true
  },
  { 
    id: "sal-54", 
    nombre: "Natilla Cremosa", 
    precio: 500, 
    desc: "El complemento perfecto para tu pinto (40ml).", 
    disponible: true
  },
  { 
    id: "sal-51", 
    nombre: "Salsa Caribeña", 
    precio: 500, 
    desc: "Toque dulce y picante suave con aroma a limón (40ml).", 
    disponible: true
  },
  { 
    id: "sal-52", 
    nombre: "Alioli de Chipotle Ahumado", 
    precio: 500, 
    desc: "Con Sabor a Ajo, Ahumada, cremosa y con picante medio (40ml).", 
    disponible: true
  }
];

export const MENU_FAMILIAR: ProductoMenu[] = [
  {
    id: "fam-supremo",
    nombre: "Supremo Familiar",
    apodo: '"La Bestia"',
    precio: 38000,
    descripcion: "El banquete definitivo y más imponente. Un festín que lo tiene todo: Capa base de tortilla, 1.5kg de Gallo Pinto, 1kg de Cerdo Mechado y Topping de Aguacate nacional. ¡La experiencia total!",
    imagen: "supremo-familiar.webp",
    disponible: true,
    activo: false,
    personalizable: false,
    vinculoIndividual: { categoria: 'lingotes', nombre: 'Lingote Supremo' }
  },
  {
    id: "fam-1",
    nombre: "Clásico Familiar",
    apodo: '"El Machillo"',
    precio: 9500,
    descripcion: "Nuestra tortilla artesanal en formato gigante para 10 personas. Perfecta para compartir en familia o eventos. (Se entrega en bandeja de aluminio térmica).",
    imagen: "clasico-familiar.webp",
    disponible: true,
    personalizable: false,
    vinculoIndividual: { categoria: 'lingotes', nombre: 'Lingote Clásico' }
  },
  {
    id: "fam-2",
    nombre: "Tico Familiar",
    apodo: '"El Pintico"',
    precio: 18000,
    descripcion: "El alma de Costa Rica para 10-12 personas. Capa base de tortilla española, 1.5kg de Gallo Pinto y Topping de Maduros. ¡Incluye un frasco de Alioli de regalía!",
    imagen: "tico-familiar.webp",
    disponible: true,
    personalizable: false,
    vinculoIndividual: { categoria: 'lingotes', nombre: 'Lingote Tico' }
  },
  {
    id: "fam-patron",
    nombre: "Patrón Familiar",
    apodo: '"El Cacique"',
    precio: 27000,
    descripcion: "El que manda en la mesa. 1kg de Cerdo Mechado sobre nuestra tortilla artesanal, con aguacate y cebolla encurtida. Un banquete con el respeto del jefe original.",
    imagen: "patron-familiar.webp",
    disponible: true,
    activo: false,
    personalizable: false,
    vinculoIndividual: { categoria: 'lingotes', nombre: 'Lingote Patrón' }
  },
  {
    id: "fam-soberano",
    nombre: "Soberano Familiar",
    apodo: '"El Tata"',
    precio: 32000,
    descripcion: "La máxima autoridad. Tortilla artesanal elevada con frijoles arreglados, cerdo mechado al vino blanco, pico de gallo y el toque de oro del aguacate.",
    imagen: "soberano-familiar.webp",
    disponible: true,
    activo: false,
    personalizable: false,
    vinculoIndividual: { categoria: 'lingotes', nombre: 'Lingote Soberano' }
  },
  {
    id: "fam-3",
    nombre: "Tarta al Revés Familiar",
    apodo: '"La Chineada"',
    precio: 27000,
    descripcion: "Nuestra joya dulce en formato XL. Mousse horneada de queso con corona de plátano maduro caramelizado. Ideal para celebraciones especiales (10-12 porciones).",
    imagen: "tarta-familiar.webp",
    disponible: true,
    personalizable: false,
    vinculoIndividual: { categoria: 'postres', nombre: 'Tarta al Revés' }
  }
];
