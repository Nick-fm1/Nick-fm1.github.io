# Sebastián Moreno — Portfolio & Engineering Showcase

> **Web & Product Developer** especialista en **UX/UI, Frontend e Ingeniería Full-Stack**. Diseño experiencias claras, accesibles y las convierto en productos digitales escalables y de alto rendimiento.

![Lighthouse Performance](https://img.shields.io/badge/Lighthouse_Performance-99-brightgreen?style=for-the-badge)
![Lighthouse Accessibility](https://img.shields.io/badge/Lighthouse_Accessibility-100-brightgreen?style=for-the-badge)
![axe-core](https://img.shields.io/badge/axe--core_WCAG_AA-0_violaciones-brightgreen?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-HTML5_%7C_CSS3_%7C_JS_Vanilla_%7C_WebGL-blue?style=for-the-badge)

---

## ⭐ Caso destacado: ARDO Marketing

Auditoría del sitio en producción de una agencia de marketing: **embudo de conversión, layout móvil, WCAG 2.2 AA y rendimiento**, con evidencia reproducible y código de solución priorizado.

| Hallazgo principal (medido) | Valor |
|---|---|
| Canales de contacto de la home que llegan a la agencia | **0 de 3** (`mailto` a `example.com`, teléfono de la plantilla demo, WhatsApp con `http://`) |
| CTA principal del hero en un móvil de 390 px | **65 × 11 px**, texto de 4 px |
| Lighthouse Performance móvil / LCP | **57** / **11,5 s** (mediana de 3 corridas) |
| Fallos WCAG críticos o serios (axe-core) | **39** |

📄 **[Leer la auditoría técnica completa →](guia-ardo-marketing.md)** (formato STAR, metodología, hallazgos por criterio WCAG, código antes/después y plan P0–P2).

> Las cifras "Antes" son mediciones del sitio público (27-09-2026). Las cifras "Después" son objetivos proyectados con su base de cálculo; la propuesta no está desplegada en el sitio de ARDO.

---

## 💡 Enfoque y criterio técnico

* **Núcleo sin frameworks:** HTML5 semántico, CSS3 moderno (Custom Properties, Grid, `clamp()`, `color-mix()`) y JavaScript Vanilla. Sin build ni dependencias en tiempo de carga.
* **CSS moderno como mejora progresiva:** View Transitions para el cambio de tema, animaciones ligadas al scroll (`animation-timeline`) sin JavaScript, `@starting-style` para el menú móvil, `@property`, `:has()` y `text-wrap`. Todo respeta `prefers-reduced-motion`, y sin soporte la página funciona igual.
* **CSS minificado con Lightning CSS:** `styles.css` es la fuente legible; se publica `styles.min.css` (6 KB con gzip).
* **Fuentes autoalojadas:** tres archivos woff2 (57 KB) servidos desde el propio dominio, con la fuente del titular precargada. Se elimina la cadena de peticiones a Google Fonts que bloqueaba el primer pintado.
* **3D bajo demanda:** el visor `<model-viewer>` (≈ 250 KB de JS + modelo de 2,9 MB) solo se descarga cuando el visitante pulsa "Activar vista 3D". Respeta `prefers-reduced-motion` (sin rotación automática) y mueve el foco del teclado al visor al cargarlo.
* **Tema claro/oscuro sin destello:** el tema se aplica con un script mínimo en el `<head>` antes del primer pintado; la elección se guarda en `localStorage` con respaldo si el almacenamiento está bloqueado.
* **Accesibilidad verificada, no declarada:** contraste AA en ambos temas (tokens por sección para la zona invertida), `skip-link`, landmarks y encabezados en orden, cierre del menú con Escape, anuncios con `aria-live` y tamaños táctiles ≥ 24 px.

## 📊 Métricas del propio portafolio

Lighthouse 12 móvil, mediana de 3 corridas, antes y después de esta refactorización. Ambas versiones se midieron en las mismas condiciones, bloqueando el script que el antivirus de la máquina inyecta en cada página. En producción (https://nick-fm1.github.io/) el resultado es Performance 99, Accessibility 100, Best Practices 100 y SEO 100.

| Métrica | Antes | Después |
|---|---|---|
| Performance | 39 | **99** |
| Accessibility | 96 | **100** |
| Largest Contentful Paint | 18,9 s | **1,8 s** |
| Total Blocking Time | 1.219 ms | **0 ms** |
| Peso transferido en la carga inicial | 3.013 KiB | **122 KiB** |
| Peticiones | 11 | **6** |
| Violaciones axe-core (claro / oscuro) | 8 / 12 | **0 / 0** |

Casi todo el ahorro vino de dos decisiones: retirar un modelo 3D decorativo de 8,9 MB de la tarjeta del caso, y cargar el visor del hero solo cuando el visitante lo pide. Autoalojar las fuentes eliminó además la cadena de peticiones a Google Fonts.

## ✅ Validación

Antes de publicar se ejecutan estas comprobaciones:

| Chequeo | Herramienta | Estado |
|---|---|---|
| Sintaxis JS | `node --check script.js` | ✔ |
| Nombres sin definir / variables sin uso | ESLint 9 (`no-undef`, `no-unused-vars`, globals de navegador) | ✔ 0 problemas |
| Referencias cruzadas | Script propio: anclas `#`, `aria-controls`/`aria-labelledby`, ids duplicados, archivos locales, selectores de `script.js` | ✔ |
| HTML | `html-validate` (recommended) | ✔ (1 excepción documentada: `role="region"` del contenedor de tabla con scroll) |
| CSS | `css-tree` (parseo y validación de 842 declaraciones) | ✔ |
| Accesibilidad | axe-core 4 a 390 y 320 px, tema claro y oscuro | ✔ 0 violaciones |
| Reflow | Sin desbordamiento horizontal a 320 px (WCAG 1.4.10) | ✔ |

---

## 📁 Estructura del proyecto

```text
portfolio-github/
├── index.html               # Estructura semántica, caso de estudio ARDO y visor 3D bajo demanda
├── styles.css               # Tokens de diseño, componentes, caso de estudio y layouts responsive
├── script.js                # Tema, menú accesible, copiar email y carga diferida del 3D
├── og-image.png             # Imagen para previsualización en redes (1200 × 630)
├── fonts/                   # Plus Jakarta Sans (variable) y DM Mono autoalojadas, subconjunto latino + licencias OFL
├── guia-ardo-marketing.md   # Auditoría técnica completa del caso ARDO (STAR)
├── .gitignore               # Exclusión de temporales del sistema y configuraciones locales
└── README.md                # Este documento
```

## 🚀 Ejecución local

No requiere build. Basta un servidor estático:

```bash
npx http-server . -p 8080
```
