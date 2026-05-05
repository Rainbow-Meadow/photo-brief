(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const photoData = [
    { label: 'Wide area', status: 'Verified', note: 'Room context captured', metric: 'Wide', quality: 'Clear', good: true },
    { label: 'Main pile', status: 'Verified', note: 'Amount and scale visible', metric: 'Scale', quality: 'Clear', good: true },
    { label: 'Appliance', status: 'Needs review', note: 'Appliance handling likely needed', metric: 'Flag', quality: 'Review', good: false },
    { label: 'Access', status: 'Verified', note: 'Ground-level access shown', metric: 'Access', quality: 'Ready', good: true },
  ];

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  function setText(el, value) {
    if (el) el.textContent = value;
  }

  ready(() => {
    const landing = document.querySelector('.pb-landing');
    if (!landing) return;

    landing.classList.add('pb-tool-enabled');

    const heroPanel = landing.querySelector('.pb-command-panel');
    if (!heroPanel) return;

    const heroFrames = [...heroPanel.querySelectorAll('.grid.grid-cols-2 .pb-photo-frame')];
    const briefPaper = heroPanel.querySelector('.pb-brief-paper');
    const statusBadge = heroPanel.querySelector('.hidden.rounded-full');
    const phoneCount = heroPanel.querySelector('.rounded-full.bg-\[hsl\(var\(--pb-violet\)\/0\.18\)\]');

    const selected = new Set([0, 1]);
    let mode = 'capture';

    if (!heroPanel.querySelector('.pb-tool-console')) {
      const consoleBar = document.createElement('div');
      consoleBar.className = 'pb-tool-console';
      consoleBar.innerHTML = `
        <div class="pb-tool-tabs" role="group" aria-label="PhotoBrief workflow preview">
          <button type="button" class="is-active" data-tool-mode="capture">Capture</button>
          <button type="button" data-tool-mode="check">Check</button>
          <button type="button" data-tool-mode="brief">Brief</button>
        </div>
        <div class="pb-tool-status" aria-live="polite"><span></span> Build your brief</div>
      `;
      heroPanel.prepend(consoleBar);

      consoleBar.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', () => {
          consoleBar.querySelectorAll('button').forEach((b) => b.classList.remove('is-active'));
          button.classList.add('is-active');
          mode = button.getAttribute('data-tool-mode') || 'capture';
          heroPanel.setAttribute('data-tool-mode', mode);
          updateHeroState(true);
        });
      });
    }

    if (briefPaper && !briefPaper.querySelector('.pb-live-brief-strip')) {
      const strip = document.createElement('div');
      strip.className = 'pb-live-brief-strip';
      strip.setAttribute('aria-label', 'Selected photos in the live brief');
      strip.innerHTML = photoData.map((item, index) => `
        <button type="button" class="pb-live-slot" data-live-slot="${index}" aria-label="Toggle ${item.label} in brief">
          <span>${index + 1}</span>
        </button>
      `).join('');
      briefPaper.insertBefore(strip, briefPaper.children[2] || null);

      strip.querySelectorAll('[data-live-slot]').forEach((slot) => {
        slot.addEventListener('click', () => {
          const index = Number(slot.getAttribute('data-live-slot'));
          togglePhoto(index);
        });
      });
    }

    if (briefPaper && !briefPaper.querySelector('.pb-live-action-row')) {
      const actionRow = document.createElement('div');
      actionRow.className = 'pb-live-action-row';
      actionRow.innerHTML = `
        <button type="button" data-tool-auto>Auto-check photos</button>
        <button type="button" data-tool-reset>Reset</button>
      `;
      briefPaper.appendChild(actionRow);
      actionRow.querySelector('[data-tool-auto]')?.addEventListener('click', () => {
        selected.clear();
        photoData.forEach((_, index) => selected.add(index));
        mode = 'check';
        heroPanel.setAttribute('data-tool-mode', mode);
        heroPanel.querySelectorAll('.pb-tool-tabs button').forEach((b) => b.classList.toggle('is-active', b.getAttribute('data-tool-mode') === mode));
        updateHeroState(true);
      });
      actionRow.querySelector('[data-tool-reset]')?.addEventListener('click', () => {
        selected.clear();
        selected.add(0);
        mode = 'capture';
        heroPanel.setAttribute('data-tool-mode', mode);
        heroPanel.querySelectorAll('.pb-tool-tabs button').forEach((b) => b.classList.toggle('is-active', b.getAttribute('data-tool-mode') === mode));
        updateHeroState(true);
      });
    }

    function togglePhoto(index) {
      if (selected.has(index)) {
        if (selected.size > 1) selected.delete(index);
      } else {
        selected.add(index);
      }
      updateHeroState(true);
    }

    function updateHeroState(animated = false) {
      const count = selected.size;
      const hasFlag = [...selected].some((index) => !photoData[index].good);
      const complete = count === photoData.length;
      heroPanel.classList.toggle('is-complete', complete);
      heroPanel.classList.toggle('has-flag', hasFlag);
      heroPanel.setAttribute('data-selected-count', String(count));

      heroFrames.forEach((frame, index) => {
        const isSelected = selected.has(index);
        frame.classList.toggle('is-selected', isSelected);
        frame.classList.toggle('is-dimmed', !isSelected);
        frame.setAttribute('aria-pressed', String(isSelected));
        let badge = frame.querySelector('.pb-inspector-badge');
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'pb-inspector-badge';
          frame.appendChild(badge);
        }
        badge.textContent = isSelected ? photoData[index].status : 'Tap to add';
      });

      const slots = heroPanel.querySelectorAll('.pb-live-slot');
      slots.forEach((slot, index) => {
        const isSelected = selected.has(index);
        slot.classList.toggle('is-filled', isSelected);
        slot.classList.toggle('needs-review', isSelected && !photoData[index].good);
        slot.innerHTML = isSelected
          ? `<span>${index + 1}</span><strong>${photoData[index].label}</strong>`
          : `<span>${index + 1}</span>`;
      });

      const metricValues = briefPaper?.querySelectorAll('div.rounded-2xl span.mt-1');
      if (metricValues?.[0]) metricValues[0].textContent = `${count}/4`;
      if (metricValues?.[1]) metricValues[1].textContent = hasFlag ? 'Review' : 'None';
      if (metricValues?.[2]) metricValues[2].textContent = selected.has(3) ? 'Ground' : 'Missing';

      const summary = briefPaper?.querySelector('p.mt-4.rounded-2xl');
      const selectedLabels = [...selected].sort().map((index) => photoData[index].label.toLowerCase());
      const summaryText = complete
        ? (hasFlag ? 'Brief is complete with one handling flag: appliance review needed before quoting.' : 'Brief is complete. Required shots are ready for quote review.')
        : `Live brief includes ${selectedLabels.join(', ') || 'no photos yet'}. Add the remaining shots to make it quote-ready.`;
      setText(summary, summaryText);

      const status = heroPanel.querySelector('.pb-tool-status');
      setText(status?.querySelector('span'), complete ? 'Ready' : `${count}/4`);
      const statusText = status?.childNodes?.[1];
      if (statusText) statusText.textContent = complete ? ' Brief packet complete' : ' Build your brief';
      setText(statusBadge, complete ? (hasFlag ? 'Review' : 'Ready') : `${count}/4`);
      setText(phoneCount, `${Math.min(count + 1, 4)} / 4`);

      if (animated) {
        heroPanel.classList.remove('pb-live-pulse');
        void heroPanel.offsetWidth;
        heroPanel.classList.add('pb-live-pulse');
      }
    }

    heroFrames.forEach((frame, index) => {
      frame.setAttribute('tabindex', '0');
      frame.setAttribute('role', 'button');
      frame.setAttribute('aria-label', `Toggle ${photoData[index]?.label || 'photo'} in the live brief`);
      const activate = () => {
        heroFrames.forEach((f) => f.classList.remove('is-inspected'));
        frame.classList.add('is-inspected');
        heroPanel.setAttribute('data-inspecting', String(index + 1));
        togglePhoto(index);
      };
      frame.addEventListener('click', activate);
      frame.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate();
        }
      });
    });

    updateHeroState(false);

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
