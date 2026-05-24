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
    descripcionCompleta: 'Nuestra tortilla artesanal, jugosa y dorada, servida sobre pan crujiente y coronada con alioli casero.',
    ingredientes: 'Patata, Huevo pasteurizado, Aceite de girasol, Cebolla, Sal, Pan artesanal, Alioli.',
    alergenos: 'CONTIENE: HUEVO, GLUTEN.',
    pesoNeto: '350 g',
    registroSanitario: 'N/A',
    vidaUtilDias: 1,
    conservacion: 'Consumo inmediato.',
    instrucciones: 'Listo para consumir.',
    precioVenta: 1300,
    imagen: 'clasico.webp',
    nutricion: { calorias: 144, grasaTotal: 8.0, grasaSaturada: 1.2, grasasTrans: 0, colesterol: 45, carbohidratos: 14.0, azucares: 0.8, fibraDietetica: 1.2, proteina: 4.1, sodio: 184 },
    escandallo: { costoInsumos: 275, costoPackaging: 87, mermaPorcentaje: 5, costoFinal: 376 }
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

  // --- SALSAS & CONSERVAS ---
  {
    id: 'salsa-caribena-retail',
    nombre: 'Salsa Caribeña de Autor',
    categoria: 'salsas',
    esParaRetail: true,
    denominacion: 'Aderezo cremoso de coco y chile panameño',
    ingredientes: 'Mayonesa, Crema de coco, Chile panameño, Culantro.',
    alergenos: 'CONTIENE: HUEVO Y SOYA.',
    pesoNeto: '250 ml',
    registroSanitario: 'AS-7895-26',
    vidaUtilDias: 20,
    conservacion: 'Manténgase refrigerado.',
    instrucciones: 'Ideal para acompañar lingotes.',
    precioVenta: 3500,
    imagen: 'cas.webp',
    nutricion: { calorias: 342, grasaTotal: 32.5, grasaSaturada: 8.4, grasasTrans: 0, colesterol: 12, carbohidratos: 12.1, azucares: 7.8, fibraDietetica: 0.5, proteina: 1.1, sodio: 510 },
    escandallo: { costoInsumos: 685, costoPackaging: 250, mermaPorcentaje: 2, costoFinal: 948 }
  },
  {
    id: 'alioli-chipotle-retail',
    nombre: 'Alioli de Chipotle Asado',
    categoria: 'salsas',
    esParaRetail: true,
    denominacion: 'Salsa emulsionada de ajo y chile chipotle',
    ingredientes: 'Mayonesa (Aceite de soya, Huevo, Vinagre, Sal), Ajo fresco, Chile chipotle asado, Reducción balsámica, Perejil.',
    alergenos: 'CONTIENE: HUEVO, SOYA Y SULFITOS.',
    pesoNeto: '250 ml',
    registroSanitario: 'AS-7896-26',
    vidaUtilDias: 20,
    conservacion: 'Manténgase refrigerado.',
    instrucciones: 'Ideal para carnes rojas y lingotes.',
    precioVenta: 3500,
    imagen: 'chipotle.webp',
    nutricion: { calorias: 584, grasaTotal: 61.8, grasaSaturada: 9.2, grasasTrans: 0, colesterol: 14, carbohidratos: 4.5, azucares: 3.2, fibraDietetica: 0.8, proteina: 1.4, sodio: 626 },
    escandallo: { costoInsumos: 750, costoPackaging: 250, mermaPorcentaje: 0, costoFinal: 1000 }
  },
  {
    id: 'cebolla-encurtida-retail',
    nombre: 'Cebolla Morada Encurtida',
    categoria: 'salsas',
    esParaRetail: true,
    denominacion: 'Cebolla artesanal en conserva ácida',
    ingredientes: 'Cebolla morada, Vinagre de caña, Azúcar, Sal.',
    alergenos: 'LIBRE DE ALÉRGENOS.',
    pesoNeto: '250 g',
    registroSanitario: 'AS-7894-26',
    vidaUtilDias: 60,
    conservacion: 'Lugar fresco y seco.',
    instrucciones: 'Acompañamiento ideal.',
    precioVenta: 2500,
    imagen: 'tentacion.webp',
    nutricion: { calorias: 48, grasaTotal: 0.1, grasaSaturada: 0.0, grasasTrans: 0, colesterol: 0, carbohidratos: 11.4, azucares: 8.2, fibraDietetica: 1.1, proteina: 0.8, sodio: 480 },
    escandallo: { costoInsumos: 250, costoPackaging: 300, mermaPorcentaje: 0, costoFinal: 550 }
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
    precioVenta: 1950,
    imagen: 'torrijona.webp',
    nutricion: { calorias: 240, grasaTotal: 12.0, grasaSaturada: 6.0, grasasTrans: 0, colesterol: 55, carbohidratos: 30.0, azucares: 18.0, fibraDietetica: 0.8, proteina: 4.5, sodio: 120 },
    escandallo: { costoInsumos: 650, costoPackaging: 120, mermaPorcentaje: 0, costoFinal: 770 }
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
  propietario: "Domingo (Prototipo)",
  direccion: "Centro de Producción Gastronómica, Cartago, Costa Rica.",
  contacto: "WhatsApp: +(506) 8000-0000",
  origen: "HECHO EN COSTA RICA"
};
