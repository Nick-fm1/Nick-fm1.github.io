/**
 * Portafolio de Sebastián Moreno
 * Funcionalidad Frontend: Navegación, Cambio de Tema, Copiar Email y Visor 3D bajo demanda.
 * El tema inicial se aplica en un script del <head> para evitar el destello de tema incorrecto.
 */

const MODEL_VIEWER_SRC = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
// Subresource Integrity: si el CDN sirviera otro archivo, el navegador no lo ejecuta
const MODEL_VIEWER_SRI = 'sha384-NxrHiuPcsJaRbXc9EoFTt5OZ6WPVqKeDgcnykGs3spXmq0J7hbbGGlyUkrGuoJoA';
const HERO_MODEL_SRC = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';

const prefiereMenosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');

// 1. Elementos del DOM
// (Tipos en JSDoc: el editor y tsc --checkJs los comprueban sin necesidad de un paso de build)
/** @type {HTMLButtonElement | null} */ const menuButton = document.querySelector('#menu-button');
/** @type {HTMLElement | null} */ const navLinks = document.querySelector('#nav-links');
/** @type {HTMLButtonElement | null} */ const themeToggle = document.querySelector('#theme-toggle');
/** @type {HTMLElement | null} */ const yearSpan = document.querySelector('#year');
/** @type {HTMLButtonElement | null} */ const copyEmailBtn = document.querySelector('#copy-email-btn');
/** @type {HTMLElement | null} */ const copyText = document.querySelector('#copy-text');
/** @type {HTMLElement | null} */ const copyStatus = document.querySelector('#copy-status');
/** @type {HTMLElement | null} */ const emailText = document.querySelector('#email-text');
/** @type {HTMLButtonElement | null} */ const load3dBtn = document.querySelector('#load-3d');
/** @type {HTMLElement | null} */ const load3dLabel = document.querySelector('#load-3d-label');
/** @type {HTMLElement | null} */ const hero3d = document.querySelector('#hero-3d');
/** @type {HTMLElement | null} */ const hero3dPoster = document.querySelector('#hero-3d-poster');
/** @type {HTMLElement | null} */ const hero3dHint = document.querySelector('#hero-3d-hint');

// 2. Actualizar el año dinámicamente
if (yearSpan) {
  yearSpan.textContent = String(new Date().getFullYear());
}

// 3. Menú Mobile Responsive
if (menuButton && navLinks) {
  const cerrarMenu = () => {
    navLinks.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú');
  };

  menuButton.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
  });

  // Cerrar menú al elegir un enlace o con Escape (devolviendo el foco al botón)
  navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', cerrarMenu));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navLinks.classList.contains('is-open')) {
      cerrarMenu();
      menuButton.focus();
    }
  });
}

// 4. Copiar correo al portapapeles con feedback visual y anunciado por lectores de pantalla
if (copyEmailBtn && emailText && copyText) {
  copyEmailBtn.addEventListener('click', async () => {
    const emailToCopy = emailText.textContent.trim();

    try {
      await navigator.clipboard.writeText(emailToCopy);
      copyText.textContent = '¡Copiado! ✓';
      copyEmailBtn.classList.add('copied');
      if (copyStatus) copyStatus.textContent = 'Correo copiado al portapapeles.';

      setTimeout(() => {
        copyText.textContent = 'Copiar';
        copyEmailBtn.classList.remove('copied');
        if (copyStatus) copyStatus.textContent = '';
      }, 2500);
    } catch {
      // Sin permiso de portapapeles (http, iframe, navegador antiguo): dejar el texto seleccionado para copiarlo a mano.
      const seleccion = window.getSelection(); // puede ser null (p. ej. en un iframe oculto)
      const rango = document.createRange();
      rango.selectNodeContents(emailText);
      seleccion?.removeAllRanges();
      seleccion?.addRange(rango);
      if (copyStatus) copyStatus.textContent = 'No se pudo copiar automáticamente: el correo quedó seleccionado, usa Ctrl+C.';
    }
  });
}

// 5. Visor 3D bajo demanda: model-viewer (≈ 250 KB de JS) y el modelo (≈ 2,9 MB) solo se descargan si el visitante lo pide
/** @returns {Promise<void>} */
const cargarModelViewer = () =>
  new Promise((/** @type {(valor?: void) => void} */ resolve, reject) => {
    if (window.customElements.get('model-viewer')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.type = 'module';
    script.src = MODEL_VIEWER_SRC;
    script.crossOrigin = 'anonymous';
    script.integrity = MODEL_VIEWER_SRI;
    script.addEventListener('load', () => window.customElements.whenDefined('model-viewer').then(() => resolve()));
    script.addEventListener('error', reject);
    document.head.append(script);
  });

/** @param {string | null} theme */
const exposicionPorTema = (theme) => (theme === 'dark' ? '1.3' : '0.9');

if (load3dBtn && load3dLabel && hero3d && hero3dPoster) {
  load3dBtn.addEventListener('click', async () => {
    load3dBtn.disabled = true;
    load3dLabel.textContent = 'Cargando vista 3D…';

    try {
      await cargarModelViewer();

      const modelo = document.createElement('model-viewer');
      modelo.id = 'hero-model';
      modelo.setAttribute('src', HERO_MODEL_SRC);
      modelo.setAttribute('alt', 'Astronauta 3D interactivo; arrastra para girarlo');
      modelo.setAttribute('camera-controls', '');
      modelo.setAttribute('disable-zoom', '');
      modelo.setAttribute('shadow-intensity', '1.5');
      modelo.setAttribute('shadow-softness', '0.8');
      modelo.setAttribute('interaction-prompt', 'none');
      modelo.setAttribute('exposure', exposicionPorTema(document.documentElement.getAttribute('data-theme')));
      if (!prefiereMenosMovimiento.matches) {
        modelo.setAttribute('auto-rotate', '');
        modelo.setAttribute('rotation-per-second', '15deg');
      }

      modelo.addEventListener('load', () => {
        hero3dPoster.remove();
        if (hero3dHint) hero3dHint.hidden = false;
      }, { once: true });

      // El botón pulsado desaparece con el póster: llevar el foco al área interactiva del visor para no perderlo en <body>.
      // Solo es enfocable cuando model-viewer retira su póster interno, por eso se espera a 'poster-dismissed'.
      modelo.addEventListener('poster-dismissed', () => {
        /** @type {HTMLElement | null | undefined} */ (modelo.shadowRoot?.querySelector('[tabindex="0"]'))?.focus();
        if (document.activeElement !== modelo) {
          hero3d.setAttribute('tabindex', '-1');
          hero3d.focus();
        }
      }, { once: true });

      hero3d.append(modelo);
    } catch {
      load3dBtn.disabled = false;
      load3dLabel.textContent = 'No se pudo cargar el 3D. Reintentar';
    }
  });
}

// 6. Alternador de Modo Oscuro / Modo Claro
/** @param {'light' | 'dark'} theme */
const aplicarTema = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle?.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
  document.querySelector('#hero-model')?.setAttribute('exposure', exposicionPorTema(theme));
};

aplicarTema(document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

themeToggle?.addEventListener('click', () => {
  const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  const cambiar = () => {
    aplicarTema(newTheme);
    try {
      localStorage.setItem('theme', newTheme);
    } catch {
      // Navegación privada o almacenamiento bloqueado: el tema se aplica igual durante la visita.
    }
  };

  // Sin soporte de View Transitions o con movimiento reducido: cambio inmediato
  if (!document.startViewTransition || prefiereMenosMovimiento.matches) {
    cambiar();
    return;
  }

  // El nuevo tema se revela con un círculo que crece desde el botón hasta la esquina más lejana
  const { left, top, width, height } = themeToggle.getBoundingClientRect();
  const x = left + width / 2;
  const y = top + height / 2;
  const radio = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  const transicion = document.startViewTransition(cambiar);
  transicion.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radio}px at ${x}px ${y}px)`] },
      { duration: 480, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
});
