export interface Nutricion {
  calorias: number;
  grasaTotal: number;
  grasaSaturada: number;
  grasasTrans: number;    // g por 100g
  colesterol: number;     // mg por 100g
  carbohidratos: number;
  azucares: number;
  fibraDietetica: number; // g por 100g
  proteina: number;
  sodio: number;
}

export interface Escandallo {
  costoInsumos: number;
  costoPackaging: number; 
  mermaPorcentaje: number;
  costoFinal: number;
}

export interface ProductoMaestro {
  id: string;
  nombre: string;
  categoria: 'lingotes' | 'postres' | 'bebidas' | 'kits' | 'insumos' | 'salsas';
  esParaRetail: boolean; 
  denominacion: string;
  descripcionCompleta?: string;
  ingredientes: string;
  alergenos: string;
  pesoNeto: string;
  registroSanitario: string;
  vidaUtilDias: number;
  conservacion: string;
  instrucciones: string;
  precioVenta: number;
  imagen: string;
  nutricion: Nutricion;
  escandallo: Escandallo;
}

export const MASTER_DATABASE: ProductoMaestro[] = [
  // --- LINGOTES DE VENTA (LOCAL) ---
  {
    id: 'lingote-clasico',
    nombre: 'Lingote Clásico',
    categoria: 'lingotes',
    esParaRetail: false,
    denominacion: 'Tortilla de patata artesanal con cebolla',
    descripcionCompleta: 'La esencia de la tradición española. Nuestra tortilla artesanal, jugosa y dorada, servida sobre pan crujiente.',
    ingredientes: 'Patata, Huevo pasteurizado, Aceite de girasol, Cebolla, Sal, Pan artesanal.',
    alergenos: 'CONTIENE: HUEVO, GLUTEN.',
    pesoNeto: '350 g',
    registroSanitario: 'N/A',
    vidaUtilDias: 1,
    conservacion: 'Consumo inmediato.',
    instrucciones: 'Listo para consumir.',
    precioVenta: 1500,
    imagen: 'clasico.webp',
    nutricion: { calorias: 144, grasaTotal: 8.0, grasaSaturada: 1.2, grasasTrans: 0, colesterol: 45, carbohidratos: 14.0, azucares: 0.8, fibraDietetica: 1.2, proteina: 4.1, sodio: 184 },
    escandallo: { costoInsumos: 450, costoPackaging: 50, mermaPorcentaje: 0, costoFinal: 500 }
  },
  {
    id: 'lingote-tico',
    nombre: 'Lingote Tico',
    categoria: 'lingotes',
    esParaRetail: false,
    denominacion: 'Encuentro de dos mundos: tortilla española, gallo pinto y plátano maduro',
    descripcionCompleta: 'El alma de nuestra tortilla española se abraza al sabor criollo del gallo pinto y la dulzura del plátano maduro.',
    ingredientes: 'Patata, Huevo pasteurizado, Arroz, Frijoles, Olores naturales, Plátano maduro, Sal.',
    alergenos: 'CONTIENE: HUEVO.',
    pesoNeto: '450 g',
    registroSanitario: 'N/A',
    vidaUtilDias: 1,
    conservacion: 'Consumo inmediato.',
    instrucciones: 'Listo para consumir.',
    precioVenta: 2000,
    imagen: 'tico.webp',
    nutricion: { calorias: 190, grasaTotal: 9.0, grasaSaturada: 1.5, grasasTrans: 0, colesterol: 45, carbohidratos: 22.0, azucares: 4.2, fibraDietetica: 2.8, proteina: 6.5, sodio: 280 },
    escandallo: { costoInsumos: 600, costoPackaging: 50, mermaPorcentaje: 0, costoFinal: 650 }
  },
  {
    id: 'lingote-patron',
    nombre: 'Lingote Patrón',
    categoria: 'lingotes',
    esParaRetail: false,
    denominacion: 'Tortilla española con cerdo mechado a fuego lento y aguacate',
    descripcionCompleta: 'Un lingote imponente cargado con 100g de cerdo mechado a fuego lento, aguacate nacional y cebolla encurtida.',
    ingredientes: 'Patata, Huevo pasteurizado, Posta de cerdo, Olores, Aguacate, Cebolla encurtida, Sal.',
    alergenos: 'CONTIENE: HUEVO.',
    pesoNeto: '480 g',
    registroSanitario: 'N/A',
    vidaUtilDias: 1,
    conservacion: 'Consumo inmediato.',
    instrucciones: 'Listo para consumir.',
    precioVenta: 3000,
    imagen: 'patron.webp',
    nutricion: { calorias: 215, grasaTotal: 12.0, grasaSaturada: 3.5, grasasTrans: 0, colesterol: 60, carbohidratos: 12.0, azucares: 1.0, fibraDietetica: 2.5, proteina: 15.0, sodio: 350 },
    escandallo: { costoInsumos: 950, costoPackaging: 50, mermaPorcentaje: 0, costoFinal: 1000 }
  },
  {
    id: 'lingote-supremo',
    nombre: 'Lingote Supremo',
    categoria: 'lingotes',
    esParaRetail: false,
    denominacion: 'Experiencia definitiva de fusión: pinto, cerdo mechado, aguacate y tortilla',
    descripcionCompleta: 'La experiencia definitiva de fusión. Un festín donde no falta nada: pinto, 100g de cerdo mechado, aguacate and tortilla.',
    ingredientes: 'Patata, Huevo pasteurizado, Arroz, Frijoles, Posta de cerdo, Aguacate, Olores, Sal.',
    alergenos: 'CONTIENE: HUEVO.',
    pesoNeto: '550 g',
    registroSanitario: 'N/A',
    vidaUtilDias: 1,
    conservacion: 'Consumo inmediato.',
    instrucciones: 'Servir caliente.',
    precioVenta: 4000,
    imagen: 'supremo.webp',
    nutricion: { calorias: 250, grasaTotal: 14.0, grasaSaturada: 4.2, grasasTrans: 0, colesterol: 70, carbohidratos: 24.0, azucares: 2.8, fibraDietetica: 3.5, proteina: 18.2, sodio: 450 },
    escandallo: { costoInsumos: 1250, costoPackaging: 50, mermaPorcentaje: 0, costoFinal: 1300 }
  },
  {
    id: 'lingote-soberano',
    nombre: 'Lingote Soberano',
    categoria: 'lingotes',
    esParaRetail: false,
    denominacion: 'Fusión suprema de tortilla española con cerdo mechado y frijol',
    descripcionCompleta: 'La joya de la corona. Nuestra tortilla artesanal elevada al máximo nivel con frijoles arreglados, cerdo mechado al vino blanco, pico de gallo y aguacate.',
    ingredientes: 'Tortilla de patatas, Cerdo mechado al vino blanco, Frijoles arreglados, Tomate, Cebolla, Culantro, Aguacate.',
    alergenos: 'CONTIENE: HUEVO, SULFITOS, GLUTEN.',
    pesoNeto: '500 g',
    registroSanitario: 'N/A',
    vidaUtilDias: 1,
    conservacion: 'Consumo inmediato.',
    instrucciones: 'Servir caliente.',
    precioVenta: 3500,
    imagen: 'soberano.webp',
    nutricion: { calorias: 210, grasaTotal: 12.5, grasaSaturada: 3.8, grasasTrans: 0, colesterol: 65, carbohidratos: 18.0, azucares: 2.5, fibraDietetica: 4.2, proteina: 18.5, sodio: 420 },
    escandallo: { costoInsumos: 1145, costoPackaging: 150, mermaPorcentaje: 2, costoFinal: 1295 }
  },
  {
    id: 'bocata-espanol',
    nombre: 'Bocata Español',
    categoria: 'lingotes',
    esParaRetail: false,
    denominacion: 'Sándwich de tortilla artesanal',
    ingredientes: 'Tortilla de Patatas, Pan Artesano, Tomate, AOVE.',
    alergenos: 'CONTIENE: HUEVO, GLUTEN.',
    pesoNeto: '300 g',
    registroSanitario: 'N/A',
    vidaUtilDias: 1,
    conservacion: 'Consumo inmediato.',
    instrucciones: 'Listo para consumir.',
    precioVenta: 2000,
    imagen: 'bocata.webp',
    nutricion: { calorias: 180, grasaTotal: 9.2, grasaSaturada: 1.5, grasasTrans: 0, colesterol: 42, carbohidratos: 22.0, azucares: 1.0, fibraDietetica: 1.8, proteina: 5.5, sodio: 210 },
    escandallo: { costoInsumos: 350, costoPackaging: 50, mermaPorcentaje: 2, costoFinal: 407 }
  },

  // --- KITS GOURMET (PARA RETAIL) ---
  {
    id: 'kit-supremo-retail',
    nombre: 'Kit Lingote Supremo XL',
    categoria: 'kits',
    esParaRetail: true,
    denominacion: 'Kit de comida preparada al vacío',
    ingredientes: 'Tortilla de patata (Patata, Huevo pasteurizado, Aceite de girasol, Cebolla, Sal), Gallo pinto (Arroz, Frijol negro, Olores), Cerdo mechado (Cerdo, Sal, Especias).',
    alergenos: 'CONTIENE: HUEVO. LIBRE DE GLUTEN.',
    pesoNeto: '560 g',
    registroSanitario: 'AS-7890-26',
    vidaUtilDias: 10,
    conservacion: 'Manténgase refrigerado (0°C a 5°C).',
    instrucciones: 'Calentar los componentes y ensamblar.',
    precioVenta: 6000,
    imagen: 'supremo.webp',
    nutricion: { calorias: 155, grasaTotal: 7.8, grasaSaturada: 1.4, grasasTrans: 0, colesterol: 38, carbohidratos: 16.2, azucares: 0.9, fibraDietetica: 2.5, proteina: 6.8, sodio: 245 },
    escandallo: { costoInsumos: 1256, costoPackaging: 450, mermaPorcentaje: 5, costoFinal: 1770 }
  },

  // --- INSUMOS AL VACÍO ---
  {
    id: 'insumo-pinto-retail',
    nombre: 'Gallo Pinto Gourmet (150g)',
    categoria: 'insumos',
    esParaRetail: true,
    denominacion: 'Arroz y frijoles con técnica de autor',
    ingredientes: 'Arroz, Frijol negro, Olores naturales, Sal, Aceite.',
    alergenos: 'LIBRE DE ALÉRGENOS.',
    pesoNeto: '150 g',
    registroSanitario: 'AS-7892-26',
    vidaUtilDias: 12,
    conservacion: 'Manténgase refrigerado.',
    instrucciones: 'Calentar 1.5 min en microondas.',
    precioVenta: 1500,
    imagen: 'tico.webp',
    nutricion: { calorias: 145, grasaTotal: 2.1, grasaSaturada: 0.3, grasasTrans: 0, colesterol: 0, carbohidratos: 26.5, azucares: 0.4, fibraDietetica: 3.2, proteina: 5.2, sodio: 310 },
    escandallo: { costoInsumos: 150, costoPackaging: 120, mermaPorcentaje: 0, costoFinal: 270 }
  },
  {
    id: 'insumo-cerdo-retail',
    nombre: 'Cerdo Mechado al Horno (100g)',
    categoria: 'insumos',
    esParaRetail: true,
    denominacion: 'Carne de cerdo desmechada en su jugo',
    ingredientes: 'Posta de cerdo, Olores, Sal, Especias.',
    alergenos: 'LIBRE DE GLUTEN.',
    pesoNeto: '100 g',
    registroSanitario: 'AS-7893-26',
    vidaUtilDias: 10,
    conservacion: 'Manténgase refrigerado.',
    instrucciones: 'Calentar en baño maría o microondas.',
    precioVenta: 3500,
    imagen: 'patron.webp',
    nutricion: { calorias: 210, grasaTotal: 12.4, grasaSaturada: 4.1, grasasTrans: 0, colesterol: 65, carbohidratos: 0.5, azucares: 0.0, fibraDietetica: 0.2, proteina: 24.5, sodio: 380 },
    escandallo: { costoInsumos: 500, costoPackaging: 120, mermaPorcentaje: 0, costoFinal: 620 }
  },

  // --- SALSAS & CONSERVAS (MOSTRADOR) ---
  {
    id: 'alioli-chipotle-240ml',
    nombre: 'Alioli de Chipotle (240ml)',
    categoria: 'salsas',
    esParaRetail: true,
    denominacion: 'Salsa emulsionada de ajo y chipotle asado',
    ingredientes: 'Aceite de girasol, Huevo pasteurizado, Chile chipotle asado, Ajo, Vinagre balsámico, Sal, Culantro.',
    alergenos: 'CONTIENE: HUEVO.',
    pesoNeto: '240 ml',
    registroSanitario: 'Pendiente',
    vidaUtilDias: 20,
    conservacion: 'Manténgase refrigerado (0°C a 5°C).',
    instrucciones: 'Consumo directo.',
    precioVenta: 3500,
    imagen: 'chipotle.webp',
    nutricion: { calorias: 580, grasaTotal: 60.0, grasaSaturada: 9.0, grasasTrans: 0, colesterol: 15, carbohidratos: 4.0, azucares: 3.0, fibraDietetica: 1.0, proteina: 1.5, sodio: 600 },
    escandallo: { costoInsumos: 700, costoPackaging: 900, mermaPorcentaje: 2, costoFinal: 1614 }
  },
  {
    id: 'salsa-caribena-240ml',
    nombre: 'Salsa Caribeña (240ml)',
    categoria: 'salsas',
    esParaRetail: true,
    denominacion: 'Aderezo cremoso de coco y chile panameño',
    ingredientes: 'Aceite de girasol, Huevo pasteurizado, Crema de coco, Chile panameño, Culantro, Jugo de limón, Sal.',
    alergenos: 'CONTIENE: HUEVO.',
    pesoNeto: '240 ml',
    registroSanitario: 'Pendiente',
    vidaUtilDias: 15,
    conservacion: 'Manténgase refrigerado (0°C a 5°C).',
    instrucciones: 'Consumo directo.',
    precioVenta: 3500,
    imagen: 'cas.webp',
    nutricion: { calorias: 340, grasaTotal: 32.0, grasaSaturada: 8.0, grasasTrans: 0, colesterol: 12, carbohidratos: 12.0, azucares: 7.5, fibraDietetica: 0.5, proteina: 1.2, sodio: 500 },
    escandallo: { costoInsumos: 650, costoPackaging: 900, mermaPorcentaje: 2, costoFinal: 1563 }
  },

  // --- POSTRES ---
  {
    id: 'torrijona-local',
    nombre: 'La Torrijona',
    categoria: 'postres',
    esParaRetail: false,
    denominacion: 'Torrija de Dona con Helado',
    ingredientes: 'Dona, Leche, Huevo, Azúcar, Helado.',
    alergenos: 'CONTIENE: LÁCTEOS, HUEVO, GLUTEN.',
    pesoNeto: '200 g',
    registroSanitario: 'N/A',
    vidaUtilDias: 1,
    conservacion: 'Refrigerado.',
    instrucciones: 'Servir frío.',
    precioVenta: 2500,
    imagen: 'torrijona.webp',
    nutricion: { calorias: 240, grasaTotal: 12.0, grasaSaturada: 6.0, grasasTrans: 0, colesterol: 55, carbohidratos: 30.0, azucares: 18.0, fibraDietetica: 0.8, proteina: 4.5, sodio: 120 },
    escandallo: { costoInsumos: 650, costoPackaging: 120, mermaPorcentaje: 0, costoFinal: 770 }
  },
  {
    id: 'tamal-frito-local',
    nombre: 'Tamal Frito en Sopa de Tres Leches',
    categoria: 'postres',
    esParaRetail: false,
    denominacion: 'Tamal de Maizena Frito con Sopa de Tres Leches',
    ingredientes: 'Maizena, Leche, Huevo, Azúcar, Harina de Trigo, Aceite de Palma, Leche en polvo Coronado.',
    alergenos: 'CONTIENE: LÁCTEOS, HUEVO, GLUTEN.',
    pesoNeto: '220 g',
    registroSanitario: 'N/A',
    vidaUtilDias: 1,
    conservacion: 'Refrigerado.',
    instrucciones: 'Servir frío con el tamal recién frito.',
    precioVenta: 3000,
    imagen: 'tamal-frito.webp',
    nutricion: { calorias: 310, grasaTotal: 14.0, grasaSaturada: 7.0, grasasTrans: 0, colesterol: 60, carbohidratos: 38.0, azucares: 22.0, fibraDietetica: 0.5, proteina: 5.5, sodio: 140 },
    escandallo: { costoInsumos: 1538, costoPackaging: 135, mermaPorcentaje: 0, costoFinal: 1673 }
  },
  {
    id: 'tarta-al-reves-maduro',
    nombre: 'Tarta al revés cremosa de queso y plátano maduro',
    categoria: 'postres',
    esParaRetail: false,
    denominacion: 'Mousse horneada de queso y plátano maduro caramelizado',
    descripcionCompleta: 'Nuestra corona dulce: Tarta horneada densa y cremosa con queso, y una capa invertida de plátano maduro punto miel caramelizado.',
    ingredientes: 'Queso crema, Plátano maduro, Azúcar, Huevo, Leche, Mantequilla.',
    alergenos: 'CONTIENE: LÁCTEOS, HUEVO.',
    pesoNeto: '180 g',
    registroSanitario: 'N/A',
    vidaUtilDias: 3,
    conservacion: 'Mantener refrigerado.',
    instrucciones: 'Servir frío.',
    precioVenta: 3000,
    imagen: 'tarta.webp',
    nutricion: { calorias: 280, grasaTotal: 16.0, grasaSaturada: 9.0, grasasTrans: 0, colesterol: 80, carbohidratos: 28.0, azucares: 22.0, fibraDietetica: 1.2, proteina: 5.0, sodio: 190 },
    escandallo: { costoInsumos: 800, costoPackaging: 120, mermaPorcentaje: 0, costoFinal: 920 }
  },
  {
    id: 'leche-frita-tres-leches',
    nombre: 'Leche frita con sopa de 3 leches',
    categoria: 'postres',
    esParaRetail: false,
    denominacion: 'Dados de crema frita en sopa de tres leches y leche Pinito',
    descripcionCompleta: 'Dados de crema pastelera fritos sumergidos en una sopa fría de tres leches y nevado con Leche Pinito.',
    ingredientes: 'Leche, Leche condensada, Leche evaporada, Crema de leche, Huevo, Harina de trigo, Azúcar, Canela, Leche Pinito.',
    alergenos: 'CONTIENE: LÁCTEOS, HUEVO, GLUTEN.',
    pesoNeto: '200 g',
    registroSanitario: 'N/A',
    vidaUtilDias: 2,
    conservacion: 'Mantener refrigerado.',
    instrucciones: 'Servir frío.',
    precioVenta: 3000,
    imagen: 'leche.webp',
    nutricion: { calorias: 290, grasaTotal: 11.5, grasaSaturada: 6.5, grasasTrans: 0, colesterol: 75, carbohidratos: 38.0, azucares: 28.0, fibraDietetica: 0.5, proteina: 6.2, sodio: 150 },
    escandallo: { costoInsumos: 900, costoPackaging: 120, mermaPorcentaje: 0, costoFinal: 1020 }
  },

  // --- BEBIDAS ---
  {
    id: 'fresco-cas-local',
    nombre: 'Fresco de Cas',
    categoria: 'bebidas',
    esParaRetail: false,
    denominacion: 'Bebida natural de Cas',
    ingredientes: 'Cas natural, Agua, Azúcar.',
    alergenos: 'LIBRE DE ALÉRGENOS.',
    pesoNeto: '470 ml',
    registroSanitario: 'N/A',
    vidaUtilDias: 1,
    conservacion: 'Refrigerado.',
    instrucciones: 'Agitar antes de abrir.',
    precioVenta: 1400,
    imagen: 'cas.webp',
    nutricion: { calorias: 45, grasaTotal: 0.1, grasaSaturada: 0.0, grasasTrans: 0, colesterol: 0, carbohidratos: 11.0, azucares: 10.5, fibraDietetica: 0.4, proteina: 0.3, sodio: 5 },
    escandallo: { costoInsumos: 350, costoPackaging: 180, mermaPorcentaje: 0, costoFinal: 530 }
  }
];

export const INFO_FABRICANTE = {
  nombre: "EL LINGOTE ESPAÑOL",
  propietario: "Domingo, Chef Dimanse",
  direccion: "Residencial Hacienda del Rey, Guadalupe, Cartago (cerca de El Guarco)",
  contacto: "WhatsApp: +(506) 72257606",
  origen: "HECHO EN COSTA RICA"
};
