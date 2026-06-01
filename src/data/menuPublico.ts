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
}

export interface Promocion extends ProductoMenu {
  precioAnterior?: number;
  ahorro?: number;
}

export const MENU_LINGOTES: ProductoMenu[] = [
  {
    id: "lin-1",
    nombre: "Lingote clásico",
    precio: 1500,
    descripcion: "La esencia de la tradición española. Nuestra tortilla artesanal, jugosa y dorada, servida con pan artesano. (Añade tus extras favoritos por ₡500).",
    imagen: "clasico.webp",
    ingredientesBase: ["Tortilla de Patatas", "Pan Artesano"],
    alergenos: ["🥚", "🌽"],
    disponible: true,
    personalizable: false 
  },
  {
    id: "lin-2",
    nombre: "Lingote Tico",
    precio: 2000,
    descripcion: "El encuentro de dos mundos. El alma de nuestra tortilla española se abraza al sabor criollo del gallo pinto y la dulzura del plátano maduro. (Servido al natural, añade natilla por ₡500).",
    imagen: "tico.webp",
    ingredientesBase: ["Tortilla de Patatas", "Gallo Pinto", "Maduro"],
    alergenos: ["🥚"],
    disponible: true,
    personalizable: false
  },
  {
    id: "lin-3",
    nombre: "Lingote Patrón",
    precio: 3000,
    descripcion: "Para los que mandan en la mesa. Un lingote imponente cargado con 100g de cerdo mechado a fuego lento, aguacate nacional y cebolla encurtida. (Personalízalo con tu salsa favorita por ₡500).",
    imagen: "patron.webp",
    ingredientesBase: ["Tortilla de Patatas", "Cerdo Mechado", "Aguacate"],
    alergenos: ["🥚"],
    disponible: true,
    personalizable: false 
  },
  {
    id: "lin-soberano",
    nombre: "Lingote Soberano",
    precio: 3500,
    descripcion: "La joya de la corona. Nuestra tortilla artesanal elevada al máximo nivel con frijoles arreglados, cerdo mechado al vino blanco, pico de gallo y el toque de oro del aguacate nacional.",
    imagen: "soberano.webp",
    ingredientesBase: ["Tortilla", "Cerdo Mechado", "Frijol Arreglado", "Aguacate"],
    alergenos: ["🥚", "🍷"],
    disponible: true,
    personalizable: false
  },
  {
    id: "lin-5",
    nombre: "Lingote Supremo",
    precio: 4000,
    descripcion: "La experiencia definitiva de fusión. Un festín donde no falta nada: pinto, 100g de cerdo mechado, aguacate y tortilla. (Añade el toque final con un extra de salsa por ₡500).",
    imagen: "supremo.webp",
    ingredientesBase: ["Tortilla", "Pinto", "Cerdo", "Aguacate"],
    alergenos: ["🥚"],
    disponible: true,
    personalizable: false 
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
    id: "pos-30", 
    nombre: "La Torrijona", 
    precio: 2500, 
    desc: "Torrija de Dona artesanal servida con helado de vainilla.", 
    imagen: "torrijona.webp", 
    alergenos: ["🥛", "🥚"], 
    disponible: true
  },
  { 
    id: "pos-31", 
    nombre: "Mestizaje Caprichoso", 
    precio: 2500, 
    desc: "Refrescante Triffle de 10oz: Capas de galleta María crujiente y cremoso artesanal de limón.", 
    imagen: "trifle.webp", 
    alergenos: ["🥛"],
    disponible: true
  },
  { 
    id: "pos-32", 
    nombre: "Lingote Vasco", 
    precio: 3000, 
    desc: "Tarta de Queso Vasca, cremosa y horneada al estilo tradicional.", 
    imagen: "vasca.webp", 
    alergenos: ["🥛"],
    disponible: true
  }
];

export const MENU_PROMOCIONES: Promocion[] = [
  {
    id: 'promo-express',
    nombre: 'EL COMBO BOCATA ⚡',
    precio: 3500,
    precioAnterior: 3900,
    ahorro: 400,
    desc: 'La opción más rápida: 1 Bocata Real (con salsa) + 1 Bebida Natural.',
    disponible: true,
  },
  {
    id: 'duo-tico',
    nombre: 'EL DÚO TICO',
    precio: 3500,
    precioAnterior: 3950,
    ahorro: 450,
    desc: 'Sabor local: 1 Lingote Tico + (Torrijona o Mestizaje Caprichoso).',
    disponible: true,
  },
  {
    id: 'PROMO-GOLOSA',
    nombre: 'LA TRILOGIA',
    precio: 4500,
    precioAnterior: 5050,
    ahorro: 550,
    desc: 'Menú completo: 1 Lingote Clásico + 1 Bebida + (Torrijona o Mestizaje Caprichoso). (Salsa se vende por separado).',
    disponible: true,
  },
  {
    id: 'PROMO-SOLO',
    nombre: 'EL MENU DEL PATRÓN',
    precio: 5000,
    precioAnterior: 6550,
    ahorro: 1550,
    desc: 'Para estómagos valientes: 1 Lingote Patrón + 1 Bebida + 1 Postre a elegir.',
    disponible: true,
  },
  {
    id: 'promo-supremo-individual',
    nombre: 'COMBO SUPREMO XL',
    precio: 6000,
    precioAnterior: 7350,
    ahorro: 1350,
    desc: 'La experiencia total para uno: 1 Lingote Supremo + 1 Bebida + 1 Postre a elegir.',
    disponible: true,
  },
  {
    id: 'PROMO-REAL',
    nombre: 'PROMO REAL + REGALÍA',
    precio: 10000,
    precioAnterior: 12700,
    ahorro: 2700,
    desc: 'Banquete para dos: 2 Lingotes Supremos + 2 Bebidas + 1 Lingote Clásico ¡GRATIS!',
    imagen: 'promo-real.webp',
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
  lunes: { abierto: "10:00", cerrado: "16:00", cerradoTodoElDia: false },
  martes: { abierto: "10:00", cerrado: "20:00", cerradoTodoElDia: false },
  miercoles: { abierto: "10:00", cerrado: "16:00", cerradoTodoElDia: false },
  jueves: { abierto: "10:00", cerrado: "20:00", cerradoTodoElDia: false },
  viernes: { abierto: "10:00", cerrado: "16:00", cerradoTodoElDia: false },
  sabado: { abierto: "10:00", cerrado: "16:00", cerradoTodoElDia: false },
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
