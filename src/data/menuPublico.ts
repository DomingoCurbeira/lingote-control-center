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
    precio: 1300,
    descripcion: "La esencia de la tradición española. Nuestra tortilla artesanal, jugosa y dorada, servida sobre pan crujiente y coronada con el alioli casero que lo empezó todo.",
    imagen: "clasico.webp",
    ingredientesBase: ["Tortilla de Patatas", "Pan", "Alioli"],
    alergenos: ["🥚", "🌽"],
    disponible: true,
    personalizable: false 
  },
  {
    id: 2,
    nombre: "Lingote Tico",
    precio: 2000,
    descripcion: "El encuentro de dos mundos. El alma de nuestra tortilla española se abraza al sabor criollo del gallo pinto y la cremosidad inconfundible de la natilla tica.",
    imagen: "tico.webp",
    ingredientesBase: ["Tortilla de Patatas", "Gallo Pinto", "Natilla"],
    alergenos: ["🥚", "🥛"],
    disponible: true,
    personalizable: false
  },
  {
    id: 3,
    nombre: "Lingote Patrón",
    precio: 3000,
    descripcion: "Para los que mandan en la mesa. Un lingote imponente cargado con 100g de cerdo mechado a fuego lento, la frescura del aguacate nacional y el toque vibrante de nuestra cebolla encurtida.",
    imagen: "patron.webp",
    ingredientesBase: ["Tortilla de Patatas", "Cerdo Mechado", "Aguacate", "Cebolla Encurtida"],
    alergenos: ["🥚"],
    disponible: true,
    personalizable: false 
  },
  {
    id: 5,
    nombre: "Lingote Supremo",
    precio: 4000,
    descripcion: "La experiencia definitiva de fusión. Un festín donde no falta nada: gallo pinto, 100g de cerdo mechado, aguacate y natilla. Un homenaje total a la hermandad gastronómica.",
    imagen: "supremo.webp",
    ingredientesBase: ["Tortilla de Patatas", "Gallo Pinto", "Cerdo Mechado", "Aguacate", "Cebolla Encurtida"],
    alergenos: ["🥚"],
    disponible: true,
    personalizable: false 
  },
  {
    id: 6,
    nombre: "Bocata Español",
    precio: 2000,
    descripcion: "Nuestra tortilla artesanal jugosa, servida en pan de baguette artesanal. ¡Ideal para el camino!",
    imagen: "bocata.webp",
    ingredientesBase: ["Tortilla de Patatas", "Pan Artesano", "Tomate", "AOVE"],
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
    desc: "Torrija de Dona con helado de vainilla", 
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
    desc: "Tarta de Queso Vasca, Típica Española", 
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
    desc: 'La opción más rápida: 1 Bocata Real (Pan Artesanal + Tortilla) + 1 Bebida Natural.',
    disponible: true,
  },
  {
    id: 'duo-tico',
    nombre: 'EL DÚO TICO',
    precio: 3000,
    precioAnterior: 3950,
    ahorro: 950,
    desc: 'Sabor local: 1 Lingote Tico + 1 Postre a elegir (Capricho de Limón o Torrijona).',
    disponible: true,
  },
  {
    id: 'PROMO-GOLOSA',
    nombre: 'LA TRILOGIA',
    precio: 4000,
    precioAnterior: 5050,
    ahorro: 1050,
    desc: 'Menú completo: 1 Lingote Clásico + 1 Bebida + 1 Postre a elegir (Capricho de Limón o Torrijona).',
    disponible: true,
  },
  {
    id: 'PROMO-SOLO',
    nombre: 'EL MENU DEL PATRÓN',
    precio: 5000,
    precioAnterior: 6550,
    ahorro: 1550,
    desc: 'Para estómagos valientes: 1 Lingote Patrón + 1 Bebida + 1 Postre a elegir (Capricho de Limón o Torrijona).',
    disponible: true,
  }
];

export const MENU_BEBIDAS: ProductoMenu[] = [
  { 
    id: 1, 
    nombre: "Fresco de Cas", 
    precio: 1400, 
    desc: "100% Natural (16oz)", 
    imagen: "cas.webp" ,
    disponible: true
  },
  { 
    id: 2, 
    nombre: "Mora en Leche", 
    precio: 1600, 
    desc: "Cremosa y dulce", 
    imagen: "mora.webp", 
    alergenos: ["🥛"],
    disponible: true 
  },
  { 
    id: 3, 
    nombre: "Chocolate", 
    precio: 1600, 
    desc: "Caliente", 
    imagen: "chocolate.webp", 
    alergenos: ["🥛"] ,
    disponible: true
  },
  { 
    id: 4, 
    nombre: "Agua Embotellada", 
    precio: 800, 
    desc: "Fría", 
    imagen: "agua.webp" ,
    disponible: true
  },
];

export const MENU_SALSAS: ProductoMenu[] = [
  { 
    id: 50, 
    nombre: "Alioli Casero", 
    precio: 500, 
    desc: "Receta tradicional española: Ajo y aceite (40ml).", 
    disponible: true
  },
  { 
    id: 51, 
    nombre: "Caribeña", 
    precio: 500, 
    desc: "Toque dulce y picante suave con aroma a limón (40ml).", 
    disponible: true
  },
  { 
    id: 52, 
    nombre: "Chipotle", 
    precio: 500, 
    desc: "Ahumada, cremosa y con picante medio (40ml).", 
    disponible: true
  },
  { 
    id: 53, 
    nombre: "Mostaza-Miel", 
    precio: 500, 
    desc: "El balance perfecto para acompañar el cerdo (40ml).", 
    disponible: true
  },
  { 
    id: 54, 
    nombre: "Natilla", 
    precio: 500, 
    desc: "Cremosa y fresca (40ml).", 
    disponible: true
  }
];
