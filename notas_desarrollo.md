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

## 💰 Estrategia de Precios (Debate)
- **Gancho:** Lingote Clásico a ₡1,500.
- **Crecimiento:** Lingote Tico a ₡2,000 (sin natilla).
- **Margen Extra:** Todas las salsas y extras a ₡500 para subir el ticket promedio de forma orgánica.
- **Sueldo:** Se garantiza el salario de Domingo (₡400k) como un gasto operativo base.
