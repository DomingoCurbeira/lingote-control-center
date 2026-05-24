export interface ProductoMenu {
  id: number | string;
  nombre: string;
  precio: number;
  desc?: string;
  descripcion?: string;
  imagen?: string;
  alergenos?: string[];
  disponible: boolean;
  personalizable?: boolean;
  ingredientesBase?: string[];
}

export interface Promocion extends ProductoMenu {
  precioAnterior?: number;
  ahorro?: number;
}

export const MENU_LINGOTES: ProductoMenu[] = [
  {
    id: 1,
    nombre: "Lingote Clásico",
    precio: 1500,
    descripcion: "La esencia de la tradición española. Nuestra tortilla artesanal, jugosa y dorada, servida sobre pan artesano. (Extras de salsa disponibles por ₡500).",
    imagen: "clasico.webp",
    ingredientesBase: ["Tortilla de Patatas", "Pan Artesano"],
    alergenos: ["🥚", "🌽"],
    disponible: true,
    personalizable: false 
  },
  {
    id: 2,
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
    id: 3,
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
    id: 5,
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
    id: 6,
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
    id: 30, 
    nombre: "La Torrijona", 
    precio: 1950, 
    desc: "Torrija de Dona artesanal servida con helado de vainilla.", 
    imagen: "torrijona.webp", 
    alergenos: ["🥛", "🥚"], 
    disponible: true
  },
  { 
    id: 31, 
    nombre: "Mestizaje Caprichoso", 
    precio: 1950, 
    desc: "Refrescante Triffle de 10oz: Capas de galleta María crujiente y cremoso artesanal de limón.", 
    imagen: "trifle.webp", 
    alergenos: ["🥛"],
    disponible: true
  },
  { 
    id: 32, 
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
    precio: 3000,
    precioAnterior: 3400,
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
    desc: 'Sabor local: 1 Lingote Tico + 1 Postre a elegir. (Salsa se vende por separado).',
    disponible: true,
  },
  {
    id: 'PROMO-GOLOSA',
    nombre: 'LA TRILOGIA',
    precio: 4500,
    precioAnterior: 5050,
    ahorro: 550,
    desc: 'Menú completo: 1 Lingote Clásico + 1 Bebida + 1 Postre. (Salsa se vende por separado).',
    disponible: true,
  }
];

export const MENU_BEBIDAS: ProductoMenu[] = [
  { 
    id: 1, 
    nombre: "Natural de Temporada", 
    precio: 1200, 
    desc: "Fresco 100% Natural (16oz).", 
    imagen: "cas.webp" ,
    disponible: true
  },
  { 
    id: 2, 
    nombre: "Mora en Leche", 
    precio: 1600, 
    desc: "Cremosa y dulce.", 
    imagen: "mora.webp", 
    alergenos: ["🥛"],
    disponible: true 
  },
  { 
    id: 4, 
    nombre: "Agua Embotellada", 
    precio: 800, 
    desc: "Fría (500ml).", 
    imagen: "agua.webp" ,
    disponible: true
  },
];

export const MENU_SALSAS: ProductoMenu[] = [
  { 
    id: 54, 
    nombre: "Natilla Cremosa", 
    precio: 500, 
    desc: "El complemento perfecto para tu pinto (40ml).", 
    disponible: true
  },
  { 
    id: 50, 
    nombre: "Alioli Casero", 
    precio: 500, 
    desc: "Receta tradicional de la casa: Ajo y aceite (40ml).", 
    disponible: true
  },
  { 
    id: 51, 
    nombre: "Salsa Caribeña", 
    precio: 500, 
    desc: "Toque dulce y picante suave con aroma a limón (40ml).", 
    disponible: true
  },
  { 
    id: 52, 
    nombre: "Chipotle Ahumado", 
    precio: 500, 
    desc: "Ahumada, cremosa y con picante medio (40ml).", 
    disponible: true
  }
];
