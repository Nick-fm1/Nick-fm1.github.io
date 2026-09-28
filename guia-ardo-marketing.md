# Caso de estudio — ARDO Marketing

**Auditoría de producto: embudo de conversión, layout móvil y accesibilidad WCAG 2.2 AA**

| | |
|---|---|
| **Autor** | Sebastián Moreno — Web & Product Developer |
| **Sitio auditado** | [ardomarketing.com](https://ardomarketing.com/) (home, en producción) |
| **Fecha de medición** | 27-09-2026 |
| **Stack del sitio** | WordPress 7.1 · Elementor 4.2 · Slider Revolution 6.7 · tema comercial *Digtek* · jQuery 3.7 |
| **Tipo de trabajo** | Auditoría independiente + propuesta técnica con código. Las cifras "Antes" están **medidas**; las cifras "Después" son **objetivos proyectados**, no resultados en producción. |

---

## Resumen ejecutivo

La home de ARDO Marketing tiene un problema más grave que la velocidad o el diseño: **los tres canales de contacto visibles están rotos o apuntan a datos de la plantilla de demostración**. Un visitante convencido que intenta escribir por correo, llamar o abrir WhatsApp desde el menú móvil no llega a la agencia.

A eso se suman un CTA principal ilegible en móvil (65 × 11 px, texto de 4 px), un rendimiento móvil de 57/100 con un LCP de 11,5 s y 65 incumplimientos automáticos de WCAG (39 críticos o serios).

| Indicador | Medido (antes) | Objetivo (después) |
|---|---|---|
| Canales de contacto funcionales en la home | **0 de 3** | 3 de 3 |
| Tamaño del CTA principal del hero (móvil 390 px) | **65 × 11 px** · fuente 4 px | ≥ 44 × 44 px · fuente ≥ 16 px |
| Lighthouse Performance móvil (mediana de 3) | **57 / 100** | ≥ 90 / 100 |
| Largest Contentful Paint móvil (mediana) | **11,5 s** | ≤ 2,5 s |
| Violaciones axe-core (WCAG A/AA + buenas prácticas) | **65 nodos** en 9 reglas · 2 críticas | 0 críticas y 0 serias |
| Enlaces vacíos (`href=""` o `href="#"`) | **28** | 0 |

---

## Metodología

Todo lo que se reporta como "medido" se puede reproducir:

1. **Lighthouse 12** en modo móvil (throttling simulado de 4G lenta y CPU 4×), **3 corridas**; se reporta la mediana. Se bloquea el script que el antivirus de la máquina de medición inyecta en cada página (180 KiB, bloqueante): sin ese bloqueo, el rendimiento medido de ARDO caía de 57 a 32 y el de cualquier sitio salía distorsionado.
2. **axe-core 4** inyectado con Puppeteer sobre Chrome real, viewport 390 × 844 (iPhone 12–15) y 320 px (el mínimo de WCAG 1.4.10 *Reflow*), después de recorrer la página para disparar las animaciones de entrada.
3. **Script propio de chequeo móvil**: desbordamiento horizontal, áreas táctiles menores de 24 × 24 px (WCAG 2.5.8) y tamaño renderizado real de los CTA.
4. **Inspección manual del HTML servido** (`curl`): landmarks, jerarquía de encabezados, formularios, destinos de cada enlace y códigos HTTP de los destinos.

Límites: se auditó la home, no el resto del sitio; no hay acceso a la analítica de ARDO, por lo que no se reportan tasas de conversión reales.

---

## STAR

### S — Situación

ARDO es una agencia de marketing digital; su home es su principal pieza de venta y el punto de entrada de los leads. El sitio se construyó sobre un tema comercial de WordPress (Digtek) con Elementor y Slider Revolution. Al adaptar la plantilla quedaron restos de la demo: datos de contacto ficticios, enlaces vacíos, una tabla de precios con encabezados vacíos y rutas de la instalación original (`/wp/digtek/about`).

### T — Tarea

Encontrar dónde se pierden los leads entre "me interesa" y "contacté a la agencia", y priorizar las correcciones por **impacto en conversión ÷ esfuerzo**, con tres ejes:

- **Embudo:** claridad del CTA, formularios y rutas de contacto.
- **Móvil:** legibilidad, áreas táctiles, reflow a 320 px.
- **Accesibilidad WCAG 2.2 AA:** contraste, semántica, nombres accesibles, navegación por teclado.

### A — Acción

Auditoría con la metodología anterior. Hallazgos ordenados por severidad:

#### 1. Embudo de conversión — crítico

| # | Hallazgo (evidencia) | Impacto | Corrección |
|---|---|---|---|
| E1 | **Correo del footer:** el texto muestra `info@ardomarketing.com`, pero el enlace es `mailto:info@example.com`. | Cada correo iniciado desde la web se envía a un dominio de ejemplo. Pérdida silenciosa: ni el usuario ni la agencia se enteran. | `href="mailto:info@ardomarketing.com"` |
| E2 | **Teléfono del footer:** `tel:%20+208-666-0112`, el número de la demo del tema (prefijo de EE. UU.), visible como texto. | Llamadas a un número ajeno; además resta credibilidad. | Número real en formato E.164: `tel:+57…` |
| E3 | **WhatsApp del menú móvil:** el enlace es `http://+57%20314…` (protocolo web) y el texto muestra **otro número distinto** (`+57 315…`). | En móvil, el canal de mayor intención para una agencia en Colombia abre una URL inválida. | `https://wa.me/57XXXXXXXXXX?text=…` con un solo número. |
| E4 | **CTA principal del hero en móvil** ("Trabajemos Juntos"): Slider Revolution escala el lienzo de escritorio; el botón queda de **65 × 11 px con fuente de 4 px**, sin `href` (acción por JS). | El CTA más importante de la página es prácticamente invisible e imposible de tocar con precisión. Incumple WCAG 2.5.8 (mínimo 24 × 24 px). | Hero en HTML/CSS con CTA real (`<a>`) y barra de contacto fija en móvil. |
| E5 | **"Nuestros Servicios"** apunta a `/wp/digtek/about`, que redirige a `/about/` en lugar de a `/servicios/` (que sí existe). | El usuario que pide servicios aterriza en otra página: fricción y rebote. | `href="/servicios/"` |
| E6 | **28 enlaces vacíos** (15 `href=""`, 13 `href="#"`), entre ellos el botón del encabezado (sin texto ni destino). | Clics que recargan la página o no hacen nada; 13 son además invisibles para lectores de pantalla. | Eliminar o completar cada enlace. |
| E7 | **Newsletter:** casilla de privacidad **marcada por defecto**, sin enlace a la política de privacidad; placeholder en inglés ("Your email address"); botón de envío sin nombre accesible. `/politica-de-privacidad/` responde 404. | El consentimiento premarcado no es una autorización expresa (Ley 1581 de 2012 en Colombia; RGPD en la UE). Riesgo legal y de confianza. | Casilla sin marcar y `required`, enlace a una política publicada, `<label>` visible en español. |
| E8 | **Precios anuales inconsistentes** con la promesa "Ahorre dos meses pagando por anticipado" (10 × mensual). Investigación: $29.999.900 (correcto). Redes sociales: $9.999.990 publicado frente a $9.999.900 esperado. Pauta: **$6.699.000 publicado frente a $6.990.000 esperado** (dos dígitos intercambiados). | Un precio que no cuadra con la promesa genera desconfianza justo en el momento de decidir la compra. | Calcular el anual a partir del mensual en un solo lugar (el concepto lo hace en `demo.js`) en lugar de escribirlo a mano. |

#### 2. Layout móvil — alto

| # | Hallazgo | Corrección |
|---|---|---|
| M1 | El hero es un slider de escritorio escalado: la línea de beneficios ("✔ Conectamos tu propósito…") se renderiza a pocos píxeles y se superpone a la fotografía. | Contenido del hero como HTML real con tipografía fluida (`clamp()`), imagen como fondo con `object-fit`. |
| M2 | 11 áreas táctiles menores de 24 px de alto: teléfono, correo, horario y navegación del menú móvil (p. ej. 111 × 23 px). | `min-height: 44px` en los enlaces del menú y del contacto. |
| M3 | Una "píldora" decorativa vacía antes del título "¿Qué podemos hacer por tu empresa?" (restos de un *eyebrow* sin texto). | Eliminar o completar. |
| M4 | No hay desbordamiento horizontal a 390 px ni a 320 px: el offcanvas está fuera de pantalla a propósito (es correcto). | — (se valida para no introducir una regresión) |

#### 3. Accesibilidad WCAG 2.2 AA — alto

Resultado de axe-core a 390 px (65 nodos en 9 reglas):

| Regla axe | Criterio WCAG | Nodos | Detalle y corrección |
|---|---|---|---|
| `button-name` (crítica) | 4.1.2 | 2 | El botón para cerrar el menú y el de la newsletter solo tienen un ícono. → `aria-label="Cerrar menú"` / `"Suscribirme"`. |
| `color-contrast` (seria) | 1.4.3 | 21 | Blanco sobre el naranja de marca `#fc4b08` = **3,42 : 1** (mínimo 4,5 : 1). → Naranja de texto/fondo `#c2410c` = **5,18 : 1**, o texto `#0f172a` sobre el naranja actual = 5,23 : 1. El naranja vivo se mantiene para superficies decorativas. |
| `link-name` (seria) | 2.4.4, 4.1.2 | 13 | Íconos de redes sociales y logos enlazados sin texto. → `aria-label="ARDO en Instagram"`, `alt="ARDO Marketing — inicio"`. |
| `list` (seria) | 1.3.1 | 3 | Listas de precios con `<span>` como hijos directos de `<ul>`. |
| `page-has-heading-one` | 1.3.1 | 1 | La página **no tiene `<h1>`**. → `<h1>` con la propuesta de valor. |
| `landmark-one-main` | 1.3.1 | 1 | **No hay `<main>`**; el enlace "Skip to content" (en inglés) apunta a `#content`. |
| `heading-order` | 1.3.1 | 6 | Saltos `h2 → h4 → h6`: los niveles se usan por estilo, no por estructura. |
| `empty-heading` | 1.3.1 | 3 (+3 `h2` vacíos del slider) | Encabezados vacíos en la tabla de precios de la plantilla. |
| `region` | 1.3.1 | 15 | Contenido fuera de landmarks (consecuencia de no tener `<main>` ni `<nav>` en el cuerpo). |

Además: 41 de 46 imágenes sin `width`/`height`, 40 con `alt=""` (incluidos los logos de clientes de "Confían en nosotros", que son contenido y deberían tener texto alternativo). Errores de copy en elementos visibles: el `<title>` dice "Si buscar crecer" (por "Si buscas crecer"); "Contactenos" y "Confian" sin tilde.

#### 4. Rendimiento y SEO — medio

| Hallazgo | Evidencia (Lighthouse, mediana) | Corrección |
|---|---|---|
| LCP de 11,5 s | El elemento LCP es una imagen **decorativa** (`bg-shape-4.png`) con `loading="lazy"`: es lo último que se pinta, después del logo y del primer título (confirmado con `PerformanceObserver` en Chrome). | Quitar `lazy` a lo que está sobre el pliegue, `fetchpriority="high"` a la imagen real del hero, WebP/AVIF (≈ 283 KiB de ahorro). |
| 34 scripts y 42 hojas de estilo, 123 peticiones, 2,4 MB | jQuery + jQuery Migrate, SoundJS, efectos *ripples*, *reveal*, *floating*, WOW.js, Swiper, Magnific Popup… | Desactivar los módulos de Xpro que no se usan (sonido, ripples) y cargar el resto con `defer`: 1,4 s de ejecución de JS en el arranque. |
| 972 KiB de fuentes | 15 archivos: Font Awesome completo (solo se usan unos 10 íconos) + varios pesos de Poppins y Roboto. | Íconos como SVG inline; 2 pesos de una familia con `font-display: swap`. |
| Sin `<meta name="description">` | Auditoría SEO de Lighthouse. | Descripción de 150–160 caracteres orientada a la búsqueda local. |
| 2 recursos por HTTP | *Mixed content* (Best Practices 75). | Forzar HTTPS en las URL del contenido. |

### R — Resultado (proyectado)

Las cifras siguientes son **objetivos con su base de cálculo**, no mediciones en producción: la propuesta no ha sido desplegada en el sitio de ARDO.

| Métrica | Antes (medido) | Después (objetivo) | Base |
|---|---|---|---|
| Canales de contacto funcionales | 0 / 3 | 3 / 3 | Corregir E1–E3 es un cambio de 3 atributos `href`. Hoy el 100 % de los clics en esos enlaces fallan. |
| CTA primario tocable en móvil | 65 × 11 px | ≥ 44 × 44 px | WCAG 2.5.8 (24 px, mínimo AA) y la guía de 44 px de Apple/Material. |
| Violaciones axe críticas + serias | 39 nodos | 0 | Cada regla tiene una corrección de marcado directa (tabla de la sección 3). |
| Lighthouse Accessibility | 81 | ≥ 95 | Las 4 auditorías que fallan son las mismas reglas de axe corregidas. |
| Lighthouse Performance móvil | 57 | ≥ 90 | LCP sin `lazy` + imágenes modernas + desactivar módulos JS sin uso (ahorros estimados por el propio Lighthouse). |
| LCP móvil | 11,5 s | ≤ 2,5 s | Umbral "bueno" de Core Web Vitals. |
| Lighthouse SEO | 85 | 100 | Meta description + enlaces rastreables. |

**Lectura de negocio.** Los hallazgos E1–E3 no mejoran la conversión: la hacen *posible*. Es la corrección de mayor retorno del informe y se hace en menos de una hora. Las mejoras de velocidad tienen respaldo público: el estudio *Milliseconds Make Millions* (Deloitte para Google, 2020) observó que mejorar 0,1 s la velocidad móvil se asoció con hasta un +8 % de conversiones en retail. La cifra exacta para ARDO solo se puede confirmar con su analítica, por eso no se proyecta un porcentaje de conversión.

---

## Código de la solución

### 1. Canales de contacto (E1–E3)

**Antes (HTML en producción):**

```html
<!-- Menú móvil: protocolo http y número distinto al que se muestra -->
<a href="http://+57%20314XXXXXXX">+57 315XXXXXXX</a>   <!-- dos números distintos; dígitos omitidos -->

<!-- Footer: datos de la plantilla de demostración -->
<a href="mailto:info@example.com"> info@ardomarketing.com</a>
<a href="tel:%20+208-666-0112"> +208-666-0112</a>
```

**Después:**

```html
<ul class="contact-info" aria-label="Contacto">
  <li>
    <a href="https://wa.me/57XXXXXXXXXX?text=Hola%20ARDO%2C%20quiero%20una%20asesor%C3%ADa"
       rel="noopener" data-evento="lead_whatsapp">
      <svg aria-hidden="true" focusable="false">…</svg>
      Escríbenos por WhatsApp
    </a>
  </li>
  <li><a href="mailto:info@ardomarketing.com" data-evento="lead_email">info@ardomarketing.com</a></li>
  <li><a href="tel:+57XXXXXXXXXX" data-evento="lead_llamada">+57 XXX XXX XXXX</a></li>
</ul>
```

Los atributos `data-evento` permiten medir cada canal en GA4/Tag Manager y convertir las proyecciones de este informe en datos reales.

### 2. CTA del hero y barra de contacto fija en móvil (E4, M1)

```html
<a class="cta cta--primario" href="https://wa.me/57XXXXXXXXXX" data-evento="lead_hero">
  Agenda tu diagnóstico gratuito
</a>
```

```css
.cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;               /* WCAG 2.5.8 y guía de 44 px */
  padding-inline: 1.5rem;
  font-size: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  font-weight: 700;
  border-radius: 999px;
  background: #c2410c;            /* 5,18:1 con texto blanco (antes #fc4b08 = 3,42:1) */
  color: #fff;
}

.cta:focus-visible {
  outline: 3px solid #0f172a;
  outline-offset: 3px;
}

/* En móvil el contacto siempre queda a un pulgar de distancia */
@media (max-width: 767px) {
  .barra-contacto {
    position: fixed;
    inset: auto 0 0 0;
    padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom));
    background: #fff;
    box-shadow: 0 -4px 16px rgb(0 0 0 / 0.08);
  }

  .barra-contacto .cta { width: 100%; }
}
```

### 3. Newsletter con consentimiento válido (E7)

**Antes:**

```html
<input type="email" name="EMAIL" placeholder="Your email address">
<button class="newsletter-btn" type="submit"><i class="fa-regular fa-arrow-right-long"></i></button>
<input class="form-check-input" type="checkbox" value="" id="flexCheckChecked" checked="">
<label class="form-check-label" for="flexCheckChecked">Acepto la política de privacidad.</label>
```

**Después:**

```html
<label for="nl-email">Tu correo</label>
<input id="nl-email" type="email" name="EMAIL" autocomplete="email" required
       placeholder="nombre@empresa.com">

<input id="nl-consentimiento" type="checkbox" name="consentimiento" required>
<label for="nl-consentimiento">
  Autorizo el tratamiento de mis datos según la
  <a href="/politica-de-tratamiento-de-datos/">política de privacidad</a>.
</label>

<button type="submit">Suscribirme</button>
```

### 4. Estructura semántica mínima

```html
<a class="skip-link" href="#contenido">Saltar al contenido</a>
<header>
  <nav aria-label="Principal">…</nav>
</header>
<main id="contenido">
  <h1>Marketing digital para crecer con estrategia</h1>
  <section aria-labelledby="servicios-titulo">
    <h2 id="servicios-titulo">¿Qué podemos hacer por tu empresa?</h2>
    <h3>Investigación de mercados digitales</h3>
    …
  </section>
</main>
<footer>…</footer>
```

En Elementor esto se consigue sin tocar el tema: el widget de título permite elegir la etiqueta (H1–H6) independientemente del tamaño visual, y el contenedor principal admite la etiqueta `main`.

---

## Plan de implementación priorizado

| Prioridad | Cambio | Esfuerzo | Impacto |
|---|---|---|---|
| P0 — hoy | E1, E2, E3, E5: corregir 4 `href` | < 1 h | Desbloquea el 100 % de los contactos iniciados desde la home |
| P0 — hoy | E7: desmarcar el consentimiento, publicar la política y enlazarla | 1–2 h | Cumplimiento legal |
| P1 — semana 1 | E4/M1: hero en HTML con CTA real y barra de contacto fija en móvil | 1 día | CTA visible y tocable en el 100 % de las visitas móviles |
| P1 — semana 1 | Contraste, `h1`, `main`, nombres accesibles, E6 | 1 día | 0 violaciones críticas/serias |
| P2 — semana 2 | Rendimiento: LCP sin `lazy`, WebP, podar módulos JS y fuentes | 2–3 días | LCP de 13 s a menos de 2,5 s |
| P2 — continuo | Eventos `lead_*` en GA4 | 2 h | Medir la conversión real y validar este informe |

---

## Lecciones

1. **Las plantillas comerciales dejan deuda invisible.** Nadie ve un `href` mal escrito hasta que un cliente no puede contactar. Un chequeo automático de enlaces (`mailto:`, `tel:`, `wa.me`) antes de publicar habría evitado los tres hallazgos críticos.
2. **Un slider de escritorio no es un hero móvil.** Escalar un lienzo de 1920 px a 390 px convierte un botón de 16 px en uno de 4 px. El contenido que vende tiene que ser HTML real.
3. **Medir en condiciones limpias, y corregir cuando no lo fueron.** La primera versión de este informe publicó un rendimiento de 32 porque el antivirus de la máquina inyectaba un script bloqueante en cada página. Al detectarlo se bloqueó ese script, se volvió a medir (57) y se corrigieron todas las cifras. Tres corridas y su mediana protegen del ruido, pero no de un sesgo sistemático.

---

*Evidencia reproducible: Lighthouse 12 (móvil), axe-core 4 con Puppeteer/Chrome, inspección de HTML con `curl`. Medido el 27-09-2026 sobre la versión pública del sitio. Los números de teléfono reales de ARDO se omiten a propósito en este documento.*
