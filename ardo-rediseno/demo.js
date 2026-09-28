/**
 * Concepto ARDO: interacciones sin librerías.
 * - Validación accesible del formulario (no envía datos: la CSP bloquea form-action y connect-src).
 * - Contadores, foco que sigue al cursor, botones magnéticos, inclinación de la diana y carrusel.
 * El movimiento solo se activa con prefers-reduced-motion: no-preference y puntero fino.
 */

const consultaMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)');
const sinMovimiento = () => consultaMovimiento.matches || document.documentElement.dataset.movimiento === 'reducido';
const punteroFino = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// --- Día y noche -----------------------------------------------------------------
// El tema inicial lo aplica el script del <head>; aquí solo el botón y la transición.
/** @type {HTMLButtonElement | null} */ const botonTema = document.querySelector('#boton-tema');
/** @type {HTMLMetaElement | null} */ const metaColor = document.querySelector('meta[name="theme-color"]');

/** @param {'dia' | 'noche'} tema */
const aplicarTema = (tema) => {
  if (tema === 'dia') document.documentElement.setAttribute('data-tema', 'dia');
  else document.documentElement.removeAttribute('data-tema');
  botonTema?.setAttribute('aria-label', tema === 'dia' ? 'Activar modo noche' : 'Activar modo día');
  metaColor?.setAttribute('content', tema === 'dia' ? '#fff6ef' : '#0b0d12');
};

aplicarTema(document.documentElement.getAttribute('data-tema') === 'dia' ? 'dia' : 'noche');

botonTema?.addEventListener('click', () => {
  const nuevo = document.documentElement.getAttribute('data-tema') === 'dia' ? 'noche' : 'dia';
  const cambiar = () => {
    aplicarTema(nuevo);
    try { localStorage.setItem('ardo-tema', nuevo); } catch { /* almacenamiento bloqueado: el tema se aplica igual */ }
  };

  if (!document.startViewTransition || sinMovimiento()) {
    cambiar();
    return;
  }

  // El tema nuevo se revela con un círculo que crece desde el botón hasta la esquina más lejana
  const { left, top, width, height } = botonTema.getBoundingClientRect();
  const x = left + width / 2;
  const y = top + height / 2;
  const radio = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  document.startViewTransition(cambiar).ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radio}px at ${x}px ${y}px)`] },
      { duration: 650, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
    );
  });
});

// --- Menú móvil ------------------------------------------------------------------
/** @type {HTMLButtonElement | null} */ const menuBoton = document.querySelector('#menu-boton');
/** @type {HTMLElement | null} */ const menu = document.querySelector('#menu-principal');

if (menuBoton && menu) {
  /** @param {boolean} abrir */
  const alternar = (abrir) => {
    menu.classList.toggle('abierto', abrir);
    menuBoton.setAttribute('aria-expanded', String(abrir));
    menuBoton.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
  };

  menuBoton.addEventListener('click', () => alternar(!menu.classList.contains('abierto')));
  menu.querySelectorAll('a').forEach((enlace) => enlace.addEventListener('click', () => alternar(false)));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('abierto')) {
      alternar(false);
      menuBoton.focus();
    }
  });
}

// --- El foco nunca queda bajo la barra fija del móvil (WCAG 2.4.11 / 2.4.12) --------
// Chrome no aplica scroll-padding al desplazamiento que provoca el foco con Tab, así que se corrige aquí.
/** @type {HTMLElement | null} */ const barraMovil = document.querySelector('.barra-movil');
if (barraMovil) {
  document.addEventListener('focusin', (e) => {
    const el = /** @type {HTMLElement} */ (e.target);
    if (getComputedStyle(barraMovil).display === 'none' || barraMovil.contains(el)) return;
    requestAnimationFrame(() => {
      const tapado = el.getBoundingClientRect().bottom - barraMovil.getBoundingClientRect().top;
      if (tapado > 0) window.scrollBy({ top: tapado + 16, behavior: 'instant' });
    });
  });
}

// --- Formulario ---------------------------------------------------------------
/** @type {HTMLFormElement | null} */ const formulario = document.querySelector('#formulario');
/** @type {HTMLElement | null} */ const estado = document.querySelector('#form-estado');

/**
 * Marca un campo como válido o inválido y muestra u oculta su mensaje de error asociado.
 * @param {HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement} campo
 */
const marcar = (campo) => {
  const valido = campo.checkValidity();
  campo.setAttribute('aria-invalid', String(!valido));
  const error = document.getElementById(`${campo.id}-error`);
  if (error) error.hidden = valido;
  return valido;
};

if (formulario && estado) {
  /** @type {(HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement)[]} */
  const campos = [...formulario.querySelectorAll('input, textarea, select')].filter(
    (el) => el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement,
  );

  // Validar al salir de cada campo, no mientras se escribe
  campos.forEach((campo) => campo.addEventListener('blur', () => {
    if (campo.value || campo.type === 'checkbox') marcar(campo);
  }));

  formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();
    const invalidos = campos.filter((campo) => !marcar(campo));

    if (invalidos.length) {
      estado.textContent = `Revisa ${invalidos.length === 1 ? 'el campo marcado' : `los ${invalidos.length} campos marcados`}.`;
      invalidos[0].focus();
      return;
    }

    estado.textContent = 'Formulario válido. En el sitio real, tu mensaje llegaría ahora a la agencia (en este concepto no se envía nada).';
    formulario.reset();
    campos.forEach((campo) => campo.removeAttribute('aria-invalid'));
  });
}

// --- Contadores: el HTML ya trae la cifra final; aquí solo se anima de 0 a esa cifra ---
if (!sinMovimiento() && 'IntersectionObserver' in window) {
  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      const el = /** @type {HTMLElement} */ (entrada.target);
      const hasta = Number(el.dataset.hasta);
      const inicio = performance.now();
      const duracion = 1400;
      /** @param {number} ahora */
      const paso = (ahora) => {
        const t = Math.min((ahora - inicio) / duracion, 1);
        el.textContent = String(Math.round(hasta * (1 - (1 - t) ** 3)));
        if (t < 1) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
      observador.unobserve(el);
    }
  }, { threshold: 0.6 });

  document.querySelectorAll('.contador').forEach((el) => observador.observe(el));
}

// --- Interacciones de puntero (solo ratón/trackpad y sin movimiento reducido) -------
/**
 * Agrupa los eventos de puntero en un solo trabajo por fotograma: el ratón dispara más eventos que
 * fotogramas pinta la pantalla, y cada uno leía medidas (getBoundingClientRect) y escribía estilos,
 * lo que obliga a recalcular el layout varias veces por fotograma.
 * @param {HTMLElement} el Elemento cuyo hover mantiene vivo el efecto
 * @param {(e: PointerEvent) => void} fn
 * @returns {(e: PointerEvent) => void}
 */
const porFotograma = (el, fn) => {
  /** @type {PointerEvent | null} */ let ultimo = null;
  let programado = false;
  return (e) => {
    ultimo = e;
    if (programado) return;
    programado = true;
    requestAnimationFrame(() => {
      programado = false;
      // Si el puntero ya salió, el pointerleave restableció el estilo: no reescribirlo
      if (ultimo && el.matches(':hover') && !sinMovimiento()) fn(ultimo);
    });
  };
};

if (punteroFino) {
  // Foco radial que sigue al cursor dentro de cada tarjeta
  document.querySelectorAll('.foco').forEach((tarjeta) => {
    const el = /** @type {HTMLElement} */ (tarjeta);
    el.addEventListener('pointermove', porFotograma(el, (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
      // Inclinación 3D: giro alrededor del eje perpendicular a la posición del cursor.
      // Usa la propiedad rotate, así no choca con el transform de la animación de entrada.
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.rotate = `${-y} ${x} 0 ${Math.hypot(x, y) * 14}deg`;
    }), { passive: true });
    el.addEventListener('pointerleave', () => { el.style.rotate = ''; });
  });

  // Botones magnéticos: se desplazan unos píxeles hacia el cursor
  document.querySelectorAll('.magnetico').forEach((boton) => {
    const el = /** @type {HTMLElement} */ (boton);
    el.addEventListener('pointermove', porFotograma(el, (e) => {
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) * 0.18;
      const dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
      el.style.translate = `${dx}px ${dy}px`;
    }), { passive: true });
    el.addEventListener('pointerleave', () => { el.style.translate = ''; });
  });

  // La diana se inclina levemente hacia el cursor
  /** @type {HTMLElement | null} */ const hero = document.querySelector('.hero');
  /** @type {HTMLElement | null} */ const diana = document.querySelector('.diana');
  if (hero && diana) {
    hero.addEventListener('pointermove', porFotograma(hero, (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      diana.style.setProperty('--inclina-y', `${x * 14}deg`);
      diana.style.setProperty('--inclina-x', `${-y * 14}deg`);
    }), { passive: true });
    hero.addEventListener('pointerleave', () => {
      diana.style.setProperty('--inclina-y', '0deg');
      diana.style.setProperty('--inclina-x', '0deg');
    });
  }
}

// --- Carrusel de testimonios: los botones desplazan una tarjeta -------------------
/** @type {HTMLElement | null} */ const carrusel = document.querySelector('#testimonios');
if (carrusel) {
  document.querySelectorAll('[data-carrusel]').forEach((boton) => {
    boton.addEventListener('click', () => {
      const direccion = Number(/** @type {HTMLElement} */ (boton).dataset.carrusel);
      const tarjeta = carrusel.querySelector('li');
      const ancho = tarjeta ? tarjeta.getBoundingClientRect().width + 16 : carrusel.clientWidth;
      carrusel.scrollBy({ left: direccion * ancho, behavior: sinMovimiento() ? 'auto' : 'smooth' });
    });
  });
}

// --- Ajustes de lectura ------------------------------------------------------------
// El script del <head> ya los aplicó antes del primer pintado; aquí se sincroniza el panel y se guardan.
/** @type {HTMLElement | null} */ const panelAjustes = document.querySelector('#ajustes');
/** @type {HTMLElement | null} */ const estadoAjustes = document.querySelector('#ajustes-estado');
const CLAVES = /** @type {const} */ (['texto', 'contraste', 'movimiento', 'espaciado']);

if (panelAjustes) {
  const raiz = document.documentElement;
  /** @param {string} clave */
  const valor = (clave) => raiz.getAttribute(`data-${clave}`) || '';

  // Navegadores sin popover: el botón abre y cierra el panel con el atributo hidden
  if (!('popover' in HTMLElement.prototype)) {
    panelAjustes.hidden = true;
    document.querySelectorAll('[popovertarget="ajustes"]').forEach((b) => b.addEventListener('click', () => { panelAjustes.hidden = !panelAjustes.hidden; }));
  }

  const sincronizar = () => {
    panelAjustes.querySelectorAll('input').forEach((entrada) => {
      const i = /** @type {HTMLInputElement} */ (entrada);
      i.checked = i.type === 'radio' ? (valor('texto') || 'normal') === i.value : valor(i.name) === i.value;
    });
  };

  const guardar = () => {
    /** @type {Record<string, string>} */ const datos = {};
    CLAVES.forEach((k) => { if (valor(k)) datos[k] = valor(k); });
    try { localStorage.setItem('ardo-ajustes', JSON.stringify(datos)); } catch { /* almacenamiento bloqueado */ }
  };

  panelAjustes.addEventListener('change', (e) => {
    const i = /** @type {HTMLInputElement} */ (e.target);
    const activo = i.type === 'radio' ? i.value !== 'normal' : i.checked;
    if (activo) raiz.setAttribute(`data-${i.name}`, i.value);
    else raiz.removeAttribute(`data-${i.name}`);
    guardar();
    if (estadoAjustes) estadoAjustes.textContent = 'Ajuste guardado para tus próximas visitas.';
  });

  document.querySelector('#ajustes-restablecer')?.addEventListener('click', () => {
    CLAVES.forEach((k) => raiz.removeAttribute(`data-${k}`));
    guardar();
    sincronizar();
    if (estadoAjustes) estadoAjustes.textContent = 'Ajustes restablecidos.';
  });

  sincronizar();
}

// --- Menú: marca la sección visible (aria-current) ------------------------------------
/** @type {HTMLAnchorElement[]} */
const enlacesNav = [...document.querySelectorAll('.nav-lista a[href^="#"]')].filter((a) => a instanceof HTMLAnchorElement);
if (enlacesNav.length && 'IntersectionObserver' in window) {
  const secciones = enlacesNav.map((a) => document.querySelector(a.hash)).filter((s) => s instanceof HTMLElement);
  const marcarActual = (/** @type {string} */ id) => enlacesNav.forEach((a) => {
    if (a.hash === `#${id}`) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
  const espia = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => { if (e.isIntersecting) marcarActual(e.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px' }); // la sección que cruza la mitad de la pantalla
  secciones.forEach((s) => espia.observe(/** @type {HTMLElement} */ (s)));
}

// --- Planes: mensual / anual ----------------------------------------------------------
/** @type {HTMLElement | null} */ const estadoPeriodo = document.querySelector('#periodo-estado');
const formatoCop = new Intl.NumberFormat('es-CO');
document.querySelectorAll('.periodo-opcion').forEach((boton) => {
  boton.addEventListener('click', () => {
    const periodo = /** @type {HTMLElement} */ (boton).dataset.periodo === 'anual' ? 'anual' : 'mes';
    document.querySelectorAll('.periodo-opcion').forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));
    document.querySelectorAll('.plan-periodo').forEach((p) => { p.textContent = periodo === 'anual' ? '/ año' : '/ mes'; });
    document.querySelectorAll('.plan-valor').forEach((v) => {
      const el = /** @type {HTMLElement} */ (v);
      const desde = Number(el.textContent?.replace(/\D/g, '')) || 0;
      const hasta = Number(periodo === 'anual' ? el.dataset.anual : el.dataset.mes);
      if (sinMovimiento()) {
        el.textContent = `COP $${formatoCop.format(hasta)}`;
        return;
      }
      const inicio = performance.now();
      /** @param {number} ahora */
      const paso = (ahora) => {
        const t = Math.min((ahora - inicio) / 600, 1);
        el.textContent = `COP $${formatoCop.format(Math.round(desde + (hasta - desde) * (1 - (1 - t) ** 3)))}`;
        if (t < 1) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    });
    if (estadoPeriodo) estadoPeriodo.textContent = periodo === 'anual' ? 'Mostrando precios anuales: pagas 10 meses y recibes 12.' : 'Mostrando precios mensuales.';
  });
});

// --- "Cotizar este plan": preselecciona el plan en el formulario --------------------------
/** @type {HTMLSelectElement | null} */ const interes = document.querySelector('#interes');
document.querySelectorAll('[data-plan]').forEach((enlace) => {
  enlace.addEventListener('click', () => {
    if (!interes) return;
    interes.value = /** @type {HTMLElement} */ (enlace).dataset.plan || '';
    interes.removeAttribute('aria-invalid');
    const campo = interes.closest('.campo');
    campo?.classList.add('campo-resaltado');
    setTimeout(() => campo?.classList.remove('campo-resaltado'), 2400);
    // Tras el salto al formulario, el foco va al primer campo para empezar a escribir
    setTimeout(() => /** @type {HTMLElement | null} */ (document.querySelector('#nombre'))?.focus({ preventScroll: true }), sinMovimiento() ? 0 : 450);
  });
});
