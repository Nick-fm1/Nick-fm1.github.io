/**
 * Portafolio de Sebastián Moreno
 * Funcionalidad Frontend: Navegación, Modal, Copiar Email, Cambio de Tema y Ajustes 3D
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Elementos del DOM
  const menuButton = document.querySelector('#menu-button');
  const navLinks = document.querySelector('#nav-links');
  const themeToggle = document.querySelector('#theme-toggle');
  const yearSpan = document.querySelector('#year');
  const dialog = document.querySelector('#ardo-dialog');
  const copyEmailBtn = document.querySelector('#copy-email-btn');
  const copyText = document.querySelector('#copy-text');
  const emailText = document.querySelector('#email-text');
  const heroModel = document.querySelector('#hero-model');
  const projectModel = document.querySelector('#project-model');

  // 2. Actualizar el año dinámicamente
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // 3. Menú Mobile Responsive
  if (menuButton && navLinks) {
    menuButton.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    });

    // Cerrar menú al hacer clic en un enlace
    navLinks.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Abrir menú');
      });
    });
  }

  // 4. Copiar correo al portapapeles con feedback visual
  if (copyEmailBtn && emailText) {
    copyEmailBtn.addEventListener('click', async () => {
      const emailToCopy = emailText.textContent.trim();

      try {
        await navigator.clipboard.writeText(emailToCopy);
        const originalText = copyText.textContent;
        
        copyText.textContent = '¡Copiado! ✓';
        copyEmailBtn.classList.add('copied');

        setTimeout(() => {
          copyText.textContent = originalText;
          copyEmailBtn.classList.remove('copied');
        }, 2500);
      } catch (err) {
        console.error('Error al copiar el e-mail: ', err);
      }
    });
  }

  // 5. Gestión de Dialog / Modal
  document.querySelectorAll('[data-dialog-open]').forEach((button) => {
    button.addEventListener('click', () => {
      dialog?.showModal();
    });
  });

  document.querySelectorAll('[data-dialog-close]').forEach((button) => {
    button.addEventListener('click', () => {
      dialog?.close();
    });
  });

  // Cerrar el modal al hacer clic en el backdrop
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  // 6. Función para actualizar la iluminación de los modelos 3D según el tema
  const update3DLighting = (theme) => {
    const exposureValue = theme === 'dark' ? '1.3' : '0.9';
    if (heroModel) heroModel.setAttribute('exposure', exposureValue);
    if (projectModel) projectModel.setAttribute('exposure', exposureValue);
  };

  // 7. Alternador de Modo Oscuro / Modo Claro
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  let initialTheme = 'light';
  if (savedTheme) {
    initialTheme = savedTheme;
  } else if (systemPrefersDark) {
    initialTheme = 'dark';
  }

  document.documentElement.setAttribute('data-theme', initialTheme);
  update3DLighting(initialTheme);

  themeToggle?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Ajustar brillo 3D en tiempo real al cambiar de tema
    update3DLighting(newTheme);
  });


  
});