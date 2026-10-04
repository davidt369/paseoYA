# PaseoYa — Guía de Desarrollo y AutoSkill

Este documento rige el comportamiento y orquestación automática de agentes en el repositorio **PaseoYa**.

## 🧠 Orquestador Automático de Skills (AutoSkill)

Ante cada mensaje o requerimiento del usuario, el agente debe **detectar automáticamente la naturaleza del prompt** y activar las skills correspondientes ubicadas en `.agents/skills/`:

1. **Desarrollo Frontend / Angular:**
   - Si la tarea involucra componentes, directivas, servicios, routing, signals o formularios reactivos:
   - 👉 **Activar:** `.agents/skills/angular-developer/SKILL.md`
   - Directrices clave: Angular 22 Standalone Components, Reactividad con Signals (`signal`, `computed`, `linkedSignal`), nueva API `inject()`, control flow `@if`, `@for`, `@switch`.

2. **Base de Datos & Backend Supabase:**
   - Si la tarea involucra tablas, esquemas SQL, autenticación, storage o consultas a la base de datos:
   - 👉 **Activar:** `.agents/skills/supabase/SKILL.md` y `.agents/skills/supabase-postgres-best-practices/SKILL.md`
   - Directrices clave: Políticas RLS obligatorias, tipos estrictos generados, queries indexadas, no usar credenciales hardcodeadas (usar `src/environments/environment.ts`).

3. **Estilos, Diseño UI/UX y Maquetación:**
   - Si la tarea involucra estilos visuales, responsive design, componentes estéticos o accesibilidad:
   - 👉 **Activar:** `.agents/skills/tailwind-4-docs/SKILL.md` y `.agents/skills/web-design-guidelines/SKILL.md`
   - Directrices clave: Tailwind CSS v4 nativo (`@tailwindcss/postcss`), accesibilidad WCAG (labels, foco, contraste), mobile-first.

4. **Progressive Web App (PWA) & Caché:**
   - Si la tarea involucra Service Workers, funcionamiento offline, `manifest.webmanifest` o almacenamiento local:
   - 👉 **Activar:** `.agents/skills/pwa-development/SKILL.md`
   - Directrices clave: Evitar interceptar peticiones externas a Supabase en el Service Worker, control estricto de versiones de caché (`CACHE_NAME`).

5. **Pruebas Unitarias & Calidad:**
   - Si la tarea involucra tests, fixtures, mocks o cobertura:
   - 👉 **Activar:** `.agents/skills/vitest/SKILL.md`

6. **Control de Versiones & Git:**
   - Si la tarea involucra commits, branches o PRs:
   - 👉 **Activar:** `.agents/skills/git-workflow-and-versioning/SKILL.md` y `.agents/skills/conventional-commit/SKILL.md`
   - Directrices clave: Commits atómicos con formato Conventional Commits **estrictamente en español** (`feat:`, `fix:`, `refactor:`, `test:`, `style:`, `chore:`), redactados en presente o infinitivo, con descripción clara y justificación del cambio.

---

## 🛠️ Comandos de Verificación del Proyecto

* **Compilar:** `npm run build`
* **Desarrollo:** `npm start` o `npm run dev`
* **Pruebas:** `npm test`
* **Listar Skills:** `npx skills list`
