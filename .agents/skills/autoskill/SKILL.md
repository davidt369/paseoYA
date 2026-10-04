---
name: autoskill
description: >-
  Auto-detects intent from the user's prompt and orchestrates the required skills in the PaseoYa workspace (angular-developer, supabase, supabase-postgres-best-practices, tailwind-4-docs, pwa-development, vitest, git-workflow-and-versioning, web-design-guidelines). Trigger on any task, feature request, bugfix, or query to automatically route and apply the exact skill workflow.
---

# AutoSkill — Enrutador y Orquestador Inteligente de Skills

Esta skill actúa como el **cerebro de enrutamiento automático** del proyecto **PaseoYa**. Analiza la intención, tecnologías y alcance de cada prompt del usuario y despacha la ejecución siguiendo las directrices de las skills especializadas instaladas en el espacio de trabajo.

---

## 🎯 Matriz de Enrutamiento por Intención del Prompt

Cuando se reciba un prompt, evalúa las palabras clave y el objetivo para activar el conjunto de skills correspondiente:

| Tipo de Solicitud | Palabras Clave / Intención | Skills a Activar y Ejecutar |
|---|---|---|
| **Lógica Angular & Arquitectura** | componentes, signals, inject, router, formularios, servicios, pipes, estados reactivos | 1. `angular-developer`<br>2. `vitest` (si incluye tests) |
| **Estilos, UI & Maquetación** | Tailwind, CSS, diseño, responsive, colores, animaciones, márgenes, padding, temas | 1. `tailwind-4-docs`<br>2. `web-design-guidelines`<br>3. `angular-developer` |
| **Base de Datos, Backend & Auth** | Supabase, tablas, SQL, RLS, auth, login, realtime, bucket, storage, migraciones | 1. `supabase`<br>2. `supabase-postgres-best-practices` |
| **PWA & Offline** | Service Worker, PWA, manifest, cache, offline, sync, instalación móvil | 1. `pwa-development`<br>2. `angular-developer` |
| **Pruebas & Control de Calidad** | tests, unit test, spec, coverage, vitest, mocks, fixtures | 1. `vitest`<br>2. `angular-developer` |
| **Flujo Git & Versionado** | commit, branch, rama, PR, merge, conflicto, release, changelog | 1. `git-workflow-and-versioning` |
| **Feature Completa / Fullstack** | Tareas del plan de trabajo (T1-T11), módulos nuevos, integración end-to-end | Orquestación combinada (ver flujo abajo) |

---

## 🔄 Protocolo de Ejecución de Tareas Completas (Fullstack Flow)

Para solicitudes que involucran una función completa (ej. nuevo flujo de compras, validación QR, módulo gastronómico):

1. **Fase Base de Datos (si aplica):**
   - Leer y seguir `supabase-postgres-best-practices` y `supabase`.
   - Modificar/crear tablas en `supabase/schema.sql` y `supabase/seed.sql` con políticas RLS seguras.
   - Usar types estrictos y queries parametrizadas.

2. **Fase Lógica y Reactividad (Angular):**
   - Leer y seguir `angular-developer`.
   - Implementar componentes Standalone con Signals (`signal`, `computed`, `linkedSignal`), control flow moderno (`@if`, `@for`, `@switch`) y la API `inject()`.
   - Conectar con `SupabaseService` de manera tipada.

3. **Fase UI/UX y Estilos:**
   - Leer y seguir `tailwind-4-docs` y `web-design-guidelines`.
   - Usar clases nativas de Tailwind CSS v4 compatibles con `@tailwindcss/postcss`.
   - Garantizar accesibilidad (ARIA labels, contraste, navegación por teclado) y diseño responsivo móvil-primero.

4. **Fase Verificación y Calidad:**
   - Verificar compilación con `npm run build`.
   - Si incluye pruebas o regresiones críticas, aplicar `vitest`.

5. **Fase Versionado:**
   - Aplicar `git-workflow-and-versioning` con commits atómicos y descriptivos siguiendo Conventional Commits (`feat:`, `fix:`, `refactor:`).

---

## ⚡ Reglas de Oro en Ejecución

* **Cero Suposiciones:** No inventar nombres de tablas, columnas o endpoints de Supabase; revisar siempre los esquemas reales en `supabase/` y servicios en `src/app/core/services/`.
* **Tailwind v4 Nativo:** No usar directivas obsoletas `@tailwind base;` o configuración de Tailwind v3; seguir `tailwind-4-docs`.
* **Angular 22 Moderno:** No crear componentes basados en módulos NgModule; usar Standalone Components y Signals.
