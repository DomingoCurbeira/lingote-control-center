# 🥙 Proyecto: El Lingote Español - Control Center

## 🏰 Arquitectura Dual & Seguridad
- **Ruta Pública (Landing):** Es la raíz `/`. Lo único que ve el cliente al escanear el QR. Muestra el Menú Digital Premium (`src/data/menuPublico.ts`).
- **Ruta Admin (Secreta):** Se activa mediante parámetro de URL `?mode=admin` o realizando un **Triple Tap** en el logotipo principal de la Landing Page.
- **PIN de Acceso:** El panel administrativo está protegido por un PIN de 4 dígitos (Defecto: `1234`).
- **Persistencia Local:** Los datos de Rentabilidad y Bitácora residen exclusivamente en el `localStorage` del dispositivo del administrador. Nunca se exponen al cliente.

## 📈 Ingeniería Gastronómica
- **Punto de Equilibrio (Breakeven):** Se calcula basado en el **Margen de Contribución** (PVP - Costo Comida - Empaque) contra los Gastos Globales.
- **Salario Propietario:** Se integra como un rubro fijo obligatorio en los Gastos Globales (₡400,000 inicial) para blindar el sueldo del propietario desde el costo base.
- **Mermas:** Restricción estricta (mínimo 0%, máximo 99%). El desperdicio siempre debe encarecer el producto.
- **Insumos vs Productos:** Las sub-recetas (ej: pan, salsas) NO deben cargar con la cuota operativa para evitar duplicidad de costos. Solo los productos de venta final cargan el local/salario.

## 🎨 Estética & UX (Premium)
- **Visualización A4:** Uso de `origin-center` y `scale-container` con márgenes de seguridad para centrado perfecto en móviles.
- **Categorías:** El selector de la Landing Page debe caber en pantalla sin scroll (grid-cols-5).
- **Exportación PNG:** Eliminar `padding: 0` en `toPng` para respetar los márgenes simétricos de la plantilla.

## 🛠️ Estándares de Código
- **PWA Ready:** Manifest configurado para modo `standalone`. Iconos 192/512 presentes.
- **React + TS:** Interfaces estrictas para Nutrición (RTCA) y Escandallos.
- **Imágenes:** Redimensionamiento automático a 800px WebP vía Canvas para proteger el LocalStorage.
