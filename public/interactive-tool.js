(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  ready(() => {
    const landing = document.querySelector('.pb-landing');
    if (!landing) return;

    landing.classList.add('pb-tool-enabled');

    const heroPanel = landing.querySelector('.pb-command-panel');
    if (heroPanel && !heroPanel.querySelector('.pb-tool-console')) {
      const consoleBar = document.createElement('div');
      consoleBar.className = 'pb-tool-console';
      consoleBar.innerHTML = `
        <div class="pb-tool-tabs" role="group" aria-label="PhotoBrief workflow preview">
          <button type="button" class="is-active" data-tool-mode="capture">Capture</button>
          <button type="button" data-tool-mode="check">Check</button>
          <button type="button" data-tool-mode="brief">Brief</button>
        </div>
        <div class="pb-tool-status" aria-live="polite"><span></span> Live preview</div>
      `;
      heroPanel.prepend(consoleBar);

      consoleBar.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', () => {
          consoleBar.querySelectorAll('button').forEach((b) => b.classList.remove('is-active'));
          button.classList.add('is-active');
          heroPanel.setAttribute('data-tool-mode', button.getAttribute('data-tool-mode') || 'capture');
        });
      });
    }

    const frames = [...landing.querySelectorAll('.pb-photo-frame')];
    frames.forEach((frame, index) => {
      frame.setAttribute('tabindex', '0');
      frame.setAttribute('role', 'button');
      frame.setAttribute('aria-label', frame.textContent?.trim() ? `Inspect ${frame.textContent.trim()}` : 'Inspect submitted photo');
      if (!frame.querySelector('.pb-inspector-badge')) {
        const badge = document.createElement('span');
        badge.className = 'pb-inspector-badge';
        badge.textContent = index % 3 === 2 ? 'Needs review' : 'Verified';
        frame.appendChild(badge);
      }
      const activate = () => {
        frames.forEach((f) => f.classList.remove('is-inspected'));
        frame.classList.add('is-inspected');
        const panel = frame.closest('.pb-command-panel');
        if (panel) panel.setAttribute('data-inspecting', String(index + 1));
      };
      frame.addEventListener('click', activate);
      frame.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
      });
    });

    if (!reduceMotion) {
      landing.addEventListener('pointermove', (event) => {
        const x = event.clientX / Math.max(window.innerWidth, 1);
        const y = event.clientY / Math.max(window.innerHeight, 1);
        landing.style.setProperty('--pb-pointer-x', `${(x * 100).toFixed(2)}%`);
        landing.style.setProperty('--pb-pointer-y', `${(y * 100).toFixed(2)}%`);
        landing.style.setProperty('--pb-tilt-x', `${((y - 0.5) * -5).toFixed(2)}deg`);
        landing.style.setProperty('--pb-tilt-y', `${((x - 0.5) * 5).toFixed(2)}deg`);
      }, { passive: true });
    }
  });
})();
