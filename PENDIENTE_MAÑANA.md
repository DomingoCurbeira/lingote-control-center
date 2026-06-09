# 📝 Pendiente para Mañana: Branding de Productos Individuales

## Contexto
Hemos completado la arquitectura de apodos ("Nicknames") para la sección de Catering, creando una identidad visual potente y premium. El siguiente paso es extender esta identidad a los productos individuales para mantener la consistencia de marca.

## Tareas Pendientes
1.  **Actualizar `menuPublico.ts`:**
    - Añadir la propiedad `apodo` a los productos individuales correspondientes:
        - `lin-1` (Clásico) -> `apodo: '🍳 "El Machillo"'`
        - `lin-2` (Tico) -> `apodo: '🐓 "El Pintico"'`
        - `lin-3` (Patrón) -> `apodo: '🏹 "El Cacique"'`
        - `lin-soberano` (Soberano) -> `apodo: '👑 "El Tata"'`
        - `lin-5` (Supremo) -> `apodo: '👹 "La Bestia"'`
        - `pos-31` (Tarta al Revés) -> `apodo: '🍯 "La Chineada"'`

2.  **Refinar UI en `LandingPage.tsx`:**
    - Modificar el renderizado de la tarjeta estándar (individual) para que muestre el apodo.
    - **Estilo Sugerido:** Un badge o texto pequeño, elegante y sutil, que no compita con el nombre principal pero que refuerce la identidad.
    - Asegurar que la transición entre el producto individual y su versión catering (ahora vinculados) se sienta natural.

3.  **Validación Final:**
    - Revisar que la experiencia de usuario sea fluida y que los apodos aporten valor sin saturar visualmente el menú individual.
