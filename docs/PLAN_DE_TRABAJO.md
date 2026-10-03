# Plan de Trabajo y Asignación de Tareas — PaseoYa Mall

Este documento desglosa las 11 tareas prioritarias definidas para el proyecto **PaseoYa**, organizadas en módulos de desarrollo para coordinar y dividir funciones entre el equipo.

---

## 📋 Resumen de Módulos y Tareas

| # | Tarea | Módulo | Perfil Recomendado | Estado |
|---|---|---|---|---|
| **1** | Implementar la Base de Datos con Supabase | Backend & Datos | Backend / Fullstack | 🟡 Pendiente |
| **2** | Corregir Iconos de IA | UI/UX & Estética | Frontend / UI Designer | 🟡 Pendiente |
| **3** | Eliminar la Sección "Pisos Comerciales" en Home | Frontend | Frontend Developer | 🟡 Pendiente |
| **4** | Unificar la Sección "Buscar" y "Todos los Productos" | Navegación | Frontend Developer | 🟡 Pendiente |
| **5** | Mejorar la Visión de Cada Perfil de Tienda | UI/UX | Frontend / UI Designer | 🟡 Pendiente |
| **6** | Función de Reels con Enlaces de Instagram o TikTok | Multimedia | Frontend Developer | 🟡 Pendiente |
| **7** | Quitar Muestras de Horas de Parqueo | Limpieza UI | Frontend Developer | 🟡 Pendiente |
| **8** | Mejorar Estilo Estético del Menú Lateral | UI/UX | UI/UX Designer | 🟡 Pendiente |
| **9** | Realizar Pruebas del Funcionamiento de QR | QA / Testing | QA Tester / Fullstack | 🟡 Pendiente |
| **10** | Pruebas de Restaurantes y Panel de Admin | QA / Testing | QA Tester / Product Owner | 🟡 Pendiente |
| **11** | Realizar la Documentación del Proyecto | Documentación | Tech Lead | 🟡 Pendiente |

---

## 🛠️ Detalle de Tareas

### 1. Implementar la Base de Datos con Supabase
- **Objetivo:** Conectar el frontend a una instancia real de Supabase en lugar de depender de datos simulados en memoria.
- **Entregables:**
  - Ejecución de migraciones `supabase/schema.sql` y `supabase/seed.sql`.
  - Configuración de variables de entorno en `src/environments/environment.ts` (`supabaseUrl` y `supabaseKey`).
  - Activación de Row Level Security (RLS) en `stores`, `products`, `orders`, `order_items` y `profiles`.
  - Sincronización en tiempo real (*Realtime*) para actualización de estados de pedidos en mostrador.

### 2. Corregir Iconos de IA
- **Objetivo:** Reemplazar textos y emojis del botón central de IA por un icono vectorial SVG pulido (estrella/chispa u orbe radiante).
- **Entregables:**
  - Diseño vectorial SVG optimizado en `cliente-layout.component.ts`.
  - Animaciones sutiles de resplandor (*glow effect*) y micro-interacciones al hacer clic.

### 3. Eliminar la Sección "Pisos Comerciales" en el Home
- **Objetivo:** Limpiar la página de inicio para priorizar las historias, novedades y el catálogo de productos directos.
- **Entregables:**
  - Retiro de la sección "Pisos Comerciales" en `home.component.ts`.
  - Redistribución del espaciado visual hacia el feed de tiendas y catálogo destacado.

### 4. Unificar la Sección "Buscar" y "Todos los Productos"
- **Objetivo:** Crear una única pantalla de exploración comercial donde el cliente tenga la barra de búsqueda rápida y el catálogo filtrable en el mismo lugar.
- **Entregables:**
  - Redirigir `/cliente/buscar` hacia `/cliente/productos`.
  - Incorporar barra de búsqueda rápida con debounce, selector de categorías y pisos en `productos-catalogo.component.ts`.
  - Actualizar el botón "Buscar" de la barra de navegación para apuntar a esta vista unificada.

### 5. Aplicar una Mejor Visión para Cada Perfil de Tienda
- **Objetivo:** Enriquecer la vista `/cliente/tiendas/:id` para que se vea como una vitrina de lujo.
- **Entregables:**
  - Banner de portada en alta resolución, logo oficial y estado en tiempo real (Abierto/Cerrado).
  - Pestañas internas para filtrar productos por rubros propios de la tienda.
  - Indicador esquemático de ubicación en el mall y enlace de contacto directo.

### 6. Función para Reels con Enlaces de Instagram o TikTok
- **Objetivo:** Conectar los videos virales del mall con las cuentas oficiales de los comercios en Instagram y TikTok.
- **Entregables:**
  - Adición de campos `platform: 'instagram' | 'tiktok'` y `externalUrl` en el modelo `MallReel`.
  - Botón de reproducción/apertura directa en la app oficial de Instagram o TikTok.
  - Adaptación de formato 9:16 responsivo para móvil y desktop.

### 7. Quitar Muestras de Horas de Parqueo en la Interfaz
- **Objetivo:** Eliminar de toda la interfaz cualquier mención, badge o banner sobre el beneficio de las 2 horas de parqueo subterráneo.
- **Entregables:**
  - Retirar badge de parqueo en el header superior de cliente.
  - Retirar bloque de parqueo en el menú lateral blanco.
  - Retirar menciones en historias, posts del feed y catálogo de productos.
  - Limpiar textos de validación de parqueo en el checkout y detalle de pedido.

### 8. Mejorar el Estilo Estético del Menú Lateral
- **Objetivo:** Pulir el diseño del panel lateral blanco bajo estándares de diseño moderno (*Impeccable & Taste*).
- **Entregables:**
  - Jerarquía tipográfica refinada y micro-espaciados consistentes.
  - Bordes tenues en `slate-100`, fondos hover elegantes en `slate-50`.
  - Iconos vectoriales y divisores armoniosos.

### 9. Realizar Pruebas con el Funcionamiento de QR
- **Objetivo:** Validar el ciclo completo de extremo a extremo (E2E) del retiro con código QR.
- **Casos de Prueba:**
  - Creación del pedido y renderizado del QR dinámico en pantalla.
  - Persistencia del QR en `/cliente/pedidos/:id`.
  - Escaneo con cámara física desde `/comercio/validar` usando la librería `@zxing/browser`.
  - Actualización de estado del pedido a `entregado`.

### 10. Realizar Pruebas con Manejo de Restaurantes y Admin
- **Objetivo:** Verificar la operatividad de los roles de comercio y administración.
- **Casos de Prueba:**
  - Recepción de pedidos de comida y cambio de estados en `/comercio/pedidos`.
  - Edición de stock y disponibilidad de platillos en `/comercio/productos`.
  - Auditoría de transacciones y locales en `/admin`.

### 11. Realizar la Documentación del Proyecto
- **Objetivo:** Garantizar que cualquier nuevo desarrollador del equipo pueda levantar el proyecto en menos de 5 minutos.
- **Entregables:**
  - `README.md` actualizado con stack tecnológico, guía de instalación (`npm install`, `npm start`), scripts y variables de entorno.
  - Diagrama de flujo de compra y arquitectura de base de datos.
