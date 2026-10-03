# Plan de Trabajo y Asignación de Tareas — PaseoYa Mall

Este documento establece la distribución de responsabilidades y tareas entre el equipo de desarrollo compuesto por **Javier**, **Tomás** y **Pablito**.

---

## 👥 Matriz de Asignación por Integrante

| Integrante | Rol Principal | Tareas Asignadas | Enfoque Técnico |
|---|---|---|---|
| 👨‍💻 **Javier** | Backend & Tech Lead | **T1, T9, T11** | Base de datos Supabase, flujo crítico de códigos QR y documentación general |
| 👨‍💻 **Tomás** | Frontend Core & Lógica | **T3, T4, T6, T10** | Unificación de catálogo/búsqueda, home, reels con Instagram/TikTok y pruebas admin/restaurantes |
| 🎨 **Pablito** | UI/UX & Diseño Frontend | **T2, T5, T7, T8** | Iconografía de IA, perfil inmersivo de tiendas, eliminación de parqueo y diseño estético del menú lateral |

---

## 📌 Detalle de Tareas por Integrante

---

### 👨‍💻 JAVIER — Backend, Flujo QR y Documentación

#### 1. Tarea 1: Implementar la Base de Datos con Supabase
- **Alcance:**
  - Ejecutar y verificar los scripts `supabase/schema.sql` y `supabase/seed.sql` en la consola de Supabase.
  - Configurar las variables en `src/environments/environment.ts` (`supabaseUrl` y `supabaseKey`).
  - Conectar los servicios de Angular (`supabase.service.ts`, `catalog.service.ts`, `auth.service.ts`) para consultas y mutaciones reales de tiendas, productos y pedidos.
  - Asegurar la activación de políticas de seguridad Row Level Security (RLS) según roles (`cliente`, `comercio`, `admin`).
- **Archivos principales:** `src/app/core/services/supabase.service.ts`, `src/environments/environment.ts`, `supabase/schema.sql`.

#### 2. Tarea 9: Realizar Pruebas con el Funcionamiento de QR
- **Alcance:**
  - Probar la generación del token único y renderizado del código QR al completar una orden en `/cliente/checkout`.
  - Asegurar la persistencia del código QR en el historial de `/cliente/pedidos/:id`.
  - Realizar pruebas del escaneo mediante cámara física con `@zxing/browser` en el panel de comercio (`/comercio/validar`).
  - Confirmar que al escanear, el estado del pedido cambie automáticamente a `entregado`.
- **Archivos principales:** `src/app/features/comercio/pages/validar/validar-retiro.component.ts`, `src/app/features/cliente/pages/pedido-detalle/pedido-detalle.component.ts`.

#### 3. Tarea 11: Realizar la Documentación del Proyecto
- **Alcance:**
  - Redactar un `README.md` completo y profesional con descripción del proyecto y arquitectura técnica (Angular 22, Tailwind CSS, Supabase, PWA).
  - Guía paso a paso para clonar, instalar dependencias (`npm install`) y correr el servidor de desarrollo (`npm start`).
  - Lista de credenciales de prueba para clientes, administradores y comercios.
  - Diagrama de flujo de compra y validación QR.
- **Archivos principales:** `README.md`, `docs/`.

---

### 👨‍💻 TOMÁS — Frontend Core, Navegación, Multimedia y Operaciones

#### 1. Tarea 3: Eliminar la Sección "Pisos Comerciales" en el Home
- **Alcance:**
  - Retirar el bloque de "Pisos Comerciales" de la página de inicio en `home.component.ts`.
  - Reajustar la diagramación para que el flujo vaya directamente desde las historias y el buscador hacia el feed de tiendas y productos destacados.
- **Archivos principales:** `src/app/features/cliente/pages/home/home.component.ts`.

#### 2. Tarea 4: Unificar la Sección "Buscar" y "Todos los Productos"
- **Alcance:**
  - Fusionar las vistas de búsqueda y catálogo en una sola pantalla completa e interactiva.
  - Redirigir la ruta `/cliente/buscar` hacia `/cliente/productos` en `cliente.routes.ts`.
  - Implementar en `productos-catalogo.component.ts` un campo de búsqueda en vivo con debounce, filtros instantáneos por categorías, pisos y rango de precios.
  - Actualizar el botón "Buscar" de la barra de navegación para abrir directamente esta pantalla unificada.
- **Archivos principales:** `src/app/features/cliente/pages/productos-catalogo/productos-catalogo.component.ts`, `src/app/features/cliente/cliente.routes.ts`, `src/app/features/cliente/layout/cliente-layout.component.ts`.

#### 3. Tarea 6: Función para Reels con Enlaces de Videos de Instagram o TikTok
- **Alcance:**
  - Extender el modelo `MallReel` con campos `platform: 'instagram' | 'tiktok'`, `videoUrl` y `externalUrl`.
  - Agregar botones interactivos en cada reel con los logos oficiales para abrir y reproducir el video directamente en la app o web de Instagram / TikTok.
  - Adaptar la vista responsiva 9:16 con soporte para enlaces externos y tarjetas de productos asociadas.
- **Archivos principales:** `src/app/features/cliente/pages/reels/reels.component.ts`, `src/app/core/models/index.ts`.

#### 4. Tarea 10: Realizar Pruebas con Manejo de Restaurantes y Admin
- **Alcance:**
  - Simular el ciclo de atención de pedidos gastronómicos desde el panel de comercio (`/comercio/pedidos`): `en_preparacion` &rarr; `listo_para_retiro` &rarr; `entregado`.
  - Probar la gestión de stock y platillos en `/comercio/productos`.
  - Comprobar que en el panel de supervisión (`/admin`) se registren las ventas totales, métricas del mall y estado de las tiendas.
- **Archivos principales:** `src/app/features/comercio/pages/pedidos/pedidos.component.ts`, `src/app/features/admin/pages/dashboard/dashboard.component.ts`.

---

### 🎨 PABLITO — UI/UX, Estética, Perfiles de Tienda y Limpieza Visual

#### 1. Tarea 2: Corregir Iconos de IA
- **Alcance:**
  - Reemplazar el texto plano o emojis del botón central de IA en la barra de navegación por un icono vectorial SVG moderno (estilo orbe cósmico o chispa brillante de 4 puntas).
  - Aplicar micro-animaciones refinadas: resplandor suave (*subtle glow*), pulso y retroalimentación táctil al pulsar.
- **Archivos principales:** `src/app/features/cliente/layout/cliente-layout.component.ts`.

#### 2. Tarea 5: Aplicar una Mejor Visión para Cada Perfil de Tienda
- **Alcance:**
  - Rediseñar la vista de detalle de local (`/cliente/tiendas/:id`) para convertirla en una vitrina atractiva de centro comercial.
  - Banner hero inmersivo con logo flotante, horario en tiempo real (indicador verde de "Abierto ahora"), piso, número de local y botón de contacto.
  - Pestañas internas para explorar los productos clasificados por rubro propio de cada tienda.
  - Tarjetas de producto estilizadas con botón directo para agregar al pedido.
- **Archivos principales:** `src/app/features/cliente/pages/tienda-detalle/tienda-detalle.component.ts`.

#### 3. Tarea 7: Quitar Muestras de Interfaz Relacionadas con Horas de Parqueo
- **Alcance:**
  - Retirar de toda la aplicación los badges, banners y mensajes que hablen de "2 horas de parqueo gratis".
  - Limpiar el header (`🚗 2h Parqueo Gratis`), el menú lateral, los textos de las historias, los posts del feed, el catálogo de productos y el checkout.
- **Archivos principales:** `src/app/features/cliente/layout/cliente-layout.component.ts`, `src/app/features/cliente/pages/home/home.component.ts`, `src/app/features/cliente/pages/productos-catalogo/productos-catalogo.component.ts`, `src/app/features/cliente/pages/checkout/checkout.component.ts`.

#### 4. Tarea 8: Mejorar el Estilo Estético del Menú Lateral Blanco
- **Alcance:**
  - Refinar el panel lateral blanco siguiendo principios de diseño limpio (*Impeccable & Taste*).
  - Optimizar la jerarquía tipográfica, márgenes y paddings.
  - Usar bordes neutros tenues (`border-slate-100`), fondos de hover agradables (`hover:bg-slate-50`) y una presentación armónica del perfil de usuario y accesos directos.
- **Archivos principales:** `src/app/features/cliente/layout/cliente-layout.component.ts`.

---

## 🚀 Flujo de Trabajo Recomendado en Git

Para evitar conflictos de fusión (*merge conflicts*), cada integrante debe trabajar en su propia rama y enviar Pull Requests a `main`:

```bash
# Javier:
git checkout -b feature/javier-backend-supabase-qr

# Tomás:
git checkout -b feature/tomas-catalogo-reels

# Pablito:
git checkout -b feature/pablito-ui-perfil-tiendas
```
