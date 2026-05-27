# 📔 Notas de Desarrollo: El Lingote Español

## 🛡️ Seguridad: El Sistema de "Dos Puertas"
Para proteger la información financiera sin una base de datos centralizada:
- Se implementó un detector en `App.tsx` que muestra la `LandingPage.tsx` (Pública) por defecto.
- El acceso administrativo se oculta tras un **Triple Tap** en el logo de la Landing.
- Se añadió un componente `AdminLogin.tsx` con teclado numérico para validar el PIN `1234`.

## 📈 Lógica Financiera Corregida
- **Punto de Equilibrio:** Se cambió la fórmula para usar el **Margen de Contribución**. Esto permite saber cuántas unidades reales pagan los costos fijos + salario, evitando números inflados por la ganancia extra.
- **Insumos Propios:** Se añadió un flag `esProductoFinal` para que sub-recetas (como la Focaccia) no carguen con la cuota operativa del local, evitando la duplicidad de gastos.
- **Mermas:** Se restringió el input a valores positivos para evitar que el desperdicio reste costo en lugar de sumarlo.

## 📱 Ergonomía Mobile-First (PWA)
- Se configuró el `manifest.webmanifest` para que la app se instale en el escritorio del celular.
- Se implementó `origin-center` en las previsualizaciones A4 para asegurar que el documento se vea centrado y completo en cualquier tamaño de pantalla.
- Se rediseñó el selector de categorías de la Landing Page para ser una cuadrícula de 5 columnas (sin scroll).

## ☁️ Sincronización Cloud (Supabase)
Se ha integrado Supabase como base de datos en tiempo real:
- **Tabla `disponibilidad`:** Controla el stock global. Un cambio en el panel admin se refleja instantáneamente en todos los clientes vía suscripción Realtime.
- **Tabla `bitacora_ventas`:** Persistencia de cierres diarios. El Dashboard ahora calcula el rendimiento real del mes basándose en datos de la nube.
- **Seguridad:** Las políticas RLS están configuradas para acceso anónimo (público) por simplicidad operativa inicial.

## 🥘 Sistema POS y Pedidos WhatsApp
- **Zustand:** Se utiliza para gestionar el estado del carrito de compras de forma persistente en el dispositivo del cliente.
- **WhatsApp "Maestro":** Los mensajes usan códigos Unicode (`\u{...}`) para garantizar que los emojis se vean perfectos en iOS y Android.
- **Pasarela SINPE:** Flujo de 2 pasos. Primero asistente bancario con botones de copiar, luego ingreso del comprobante. Esto reduce errores de digitación.
- **Identificación:** Se implementó un perfil de usuario (nombre y teléfono) que se guarda localmente y se adjunta a cada mensaje de WhatsApp.
- **ID de Pedido:** Cada transacción genera un código aleatorio de 4 caracteres para facilitar la identificación en cocina.
