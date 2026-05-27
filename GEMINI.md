# 🥙 Proyecto: El Lingote Español - Control Center

## 🏰 Arquitectura Dual & Sincronización
- **Ruta Pública (Landing):** Raíz `/`. Menú Digital + Carrito de Compras (POS).
- **Ruta Admin (Secreta):** Triple Tap en logo + PIN 1234. Gestión de Stock, Bitácora y Finanzas.
- **Supabase (Nube):** Motor en tiempo real para Stock Global y Persistencia de Ventas.
- **Zustand:** Estado global para el Carrito de Compras (persistente en el cliente).

## 📈 Ingeniería Gastronómica & POS
- **Punto de Equilibrio (Breakeven):** Basado en Margen de Contribución. El Dashboard se sincroniza con las ventas reales de la nube.
- **Salario Propietario:** Blindado como costo fijo (₡400,000).
- **Pasarela SINPE:** Flujo de validación en 2 pasos (Asistente bancario + Ref. 4 dígitos).
- **WhatsApp "Maestro":** Pedidos con ID de 4 caracteres, fecha/hora y emojis Unicode blindados.

## 🎨 Estética & UX (Premium)
- **Visualización A4:** Centrado perfecto en móviles vía `origin-center`.
- **Categorías:** Selector grid-cols-5 (sin scroll).
- **Fusión POS:** UX de alto impacto que incluye perfil de usuario (nombre y teléfono) persistente.

## 🛠️ Estándares de Código
- **PWA Ready:** Modo `standalone`.
- **Sincronización:** Uso de `upsert` para actualizaciones de stock y bitácora sin conflictos.
- **Seguridad RLS:** Políticas de Supabase habilitadas para acceso público inicial.
