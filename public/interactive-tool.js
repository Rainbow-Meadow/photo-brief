(() => {
  const API = 'https://mvlcefiygkzzewcdzsmj.functions.supabase.co/live-preview-submission';
  const SESSION_KEY = 'pb-session';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const photos = [
    { id: 'wide-area', label: 'Wide area', status: 'Verified', note: 'Room context captured', good: true },
    { id: 'main-pile', label: 'Main pile', status: 'Verified', note: 'Amount and scale visible', good: true },
    { id: 'appliance', label: 'Appliance', status: 'Needs review', note: 'Appliance handling likely needed', good: false },
    { id: 'access', label: 'Access', status: 'Verified', note: 'Ground-level access shown', good: true },
  ];

  function onReady(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
    else fn();
  }

  function getSessionId() {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  }

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
  }

  onReady(() => {
    const landing = document.querySelector('.pb-landing');
    const panel = document.querySelector('.pb-command-panel');
    const brief = document.querySelector('.pb-brief-paper');
    if (!landing || !panel || !brief) return;

    landing.classList.add('pb-tool-enabled');
    panel.classList.add('pb-live-tool');

    const sessionId = getSessionId();
    const frames = [...panel.querySelectorAll('.grid.grid-cols-2 .pb-photo-frame')];
    const selected = new Set([0, 1]);
    const lead = { email: '', consented: false };
    let mode = 'capture';
    let requestUrl = null;
    let syncTimer = null;

    const consoleBar = document.createElement('div');
    consoleBar.className = 'pb-tool-console';
    consoleBar.innerHTML = `
      <div class="pb-tool-tabs" role="group" aria-label="PhotoBrief live preview mode">
        <button type="button" data-mode="capture">Capture</button>
        <button type="button" data-mode="check">Check</button>
        <button type="button" data-mode="brief">Brief</button>
      </div>
      <div class="pb-tool-status" aria-live="polite"><span>2/4</span> Build the brief</div>
    `;
    panel.prepend(consoleBar);

    const slotStrip = document.createElement('div');
    slotStrip.className = 'pb-live-brief-strip';
    slotStrip.setAttribute('aria-label', 'Live PhotoBrief packet slots');
    slotStrip.innerHTML = photos.map((photo, index) => `
      <button type="button" class="pb-live-slot" data-slot="${index}" aria-label="Toggle ${photo.label}">
        <span>${index + 1}</span>
      </button>
    `).join('');
    brief.insertBefore(slotStrip, brief.children[2] || null);

    const leadCard = document.createElement('div');
    leadCard.className = 'pb-lead-capture';
    leadCard.innerHTML = `
      <div>
        <strong>Your brief is ready.</strong>
        <p>Send yourself the real PhotoBrief link.</p>
      </div>
      <form>
        <label class="sr-only" for="pb-live-email">Email address</label>
        <input id="pb-live-email" name="email" autocomplete="email" inputmode="email" type="email" placeholder="you@company.com" />
        <button type="submit">Send link</button>
      </form>
      <p class="pb-lead-note">No spam. This creates a real draft PhotoBrief request.</p>
    `;
    brief.appendChild(leadCard);

    const success = document.createElement('div');
    success.className = 'pb-success';
    success.innerHTML = `<p>PhotoBrief created.</p><a target="_blank" rel="noreferrer">Open your request →</a>`;
    brief.appendChild(success);

    function payload() {
      const selectedPhotos = [...selected].sort((a, b) => a - b).map((index) => photos[index]);
      const hasFlag = selectedPhotos.some((photo) => !photo.good);
      const complete = selected.size === photos.length;
      return {
        session_id: sessionId,
        source: 'photobrief-marketing-hero',
        workflow_mode: mode,
        brief: {
          selected_count: selected.size,
          required_count: photos.length,
          readiness: complete ? 'ready' : 'incomplete',
          issue: hasFlag ? 'Appliance review needed' : null,
          summary: complete
            ? (hasFlag ? 'Brief complete with appliance review needed before quoting.' : 'Brief ready for quote review.')
            : `Brief includes ${selectedPhotos.map((photo) => photo.label.toLowerCase()).join(', ') || 'no photos yet'}.`,
        },
        photos: selectedPhotos,
        missing: photos.filter((_, index) => !selected.has(index)).map((photo) => ({ id: photo.id, label: photo.label })),
        lead,
      };
    }

    function updateUi() {
      const data = payload();
      const complete = data.brief.readiness === 'ready';
      const hasFlag = Boolean(data.brief.issue);

      panel.dataset.toolMode = mode;
      panel.dataset.readiness = data.brief.readiness;
      panel.classList.toggle('is-complete', complete);
      panel.classList.toggle('has-flag', hasFlag);

      consoleBar.querySelectorAll('[data-mode]').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.mode === mode);
      });
      const status = consoleBar.querySelector('.pb-tool-status');
      if (status) status.innerHTML = `<span>${complete ? (hasFlag ? 'Review' : 'Ready') : `${selected.size}/4`}</span> ${complete ? 'Live request can be created' : 'Build the brief'}`;

      frames.forEach((frame, index) => {
        const isSelected = selected.has(index);
        frame.classList.toggle('is-selected', isSelected);
        frame.classList.toggle('is-dimmed', !isSelected);
        frame.setAttribute('role', 'button');
        frame.setAttribute('tabindex', '0');
        frame.setAttribute('aria-pressed', String(isSelected));
        frame.setAttribute('aria-label', `Toggle ${photos[index]?.label || 'photo'} in the live brief`);
        let badge = frame.querySelector('.pb-inspector-badge');
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'pb-inspector-badge';
          frame.appendChild(badge);
        }
        badge.textContent = isSelected ? photos[index].status : 'Tap to add';
      });

      slotStrip.querySelectorAll('.pb-live-slot').forEach((slot, index) => {
        const isSelected = selected.has(index);
        slot.classList.toggle('is-filled', isSelected);
        slot.classList.toggle('needs-review', isSelected && !photos[index].good);
        slot.innerHTML = isSelected ? `<span>${index + 1}</span><strong>${photos[index].label}</strong>` : `<span>${index + 1}</span>`;
      });

      const metricValues = brief.querySelectorAll('div.rounded-2xl span.mt-1');
      if (metricValues[0]) metricValues[0].textContent = `${selected.size}/4`;
      if (metricValues[1]) metricValues[1].textContent = hasFlag ? 'Review' : 'None';
      if (metricValues[2]) metricValues[2].textContent = selected.has(3) ? 'Ground' : 'Missing';
      const summary = brief.querySelector('p.mt-4.rounded-2xl');
      if (summary) summary.textContent = data.brief.summary;

      leadCard.classList.toggle('is-visible', complete);
      success.classList.toggle('is-visible', Boolean(requestUrl));
      if (requestUrl) success.querySelector('a').href = requestUrl;
    }

    async function syncNow() {
      const data = payload();
      if (!lead.email && data.brief.readiness !== 'ready') return;
      try {
        const response = await fetch(API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await response.json().catch(() => ({}));
        if (result?.request_url) {
          requestUrl = result.request_url;
          updateUi();
        }
      } catch (error) {
        console.warn('PhotoBrief live preview sync failed', error);
      }
    }

    function scheduleSync() {
      window.clearTimeout(syncTimer);
      syncTimer = window.setTimeout(syncNow, 450);
    }

    function toggle(index) {
      if (selected.has(index)) {
        if (selected.size > 1) selected.delete(index);
      } else selected.add(index);
      panel.classList.remove('pb-live-pulse');
      void panel.offsetWidth;
      panel.classList.add('pb-live-pulse');
      updateUi();
      scheduleSync();
    }

    consoleBar.querySelectorAll('[data-mode]').forEach((button) => {
      button.addEventListener('click', () => {
        mode = button.dataset.mode || 'capture';
        updateUi();
        scheduleSync();
      });
    });

    slotStrip.querySelectorAll('[data-slot]').forEach((slot) => {
      slot.addEventListener('click', () => toggle(Number(slot.dataset.slot)));
    });

    frames.forEach((frame, index) => {
      frame.addEventListener('click', () => toggle(index));
      frame.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle(index);
        }
      });
    });

    leadCard.querySelector('form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = leadCard.querySelector('input');
      const button = leadCard.querySelector('button');
      lead.email = input.value.trim();
      lead.consented = true;
      if (!isEmail(lead.email)) {
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      button.textContent = 'Creating…';
      await syncNow();
      button.textContent = requestUrl ? 'Sent' : 'Try again';
    });

    updateUi();
    scheduleSync();

    if (!reduceMotion) {
      landing.addEventListener('pointermove', (event) => {
        const x = event.clientX / Math.max(window.innerWidth, 1);
        const y = event.clientY / Math.max(window.innerHeight, 1);
        landing.style.setProperty('--pb-tilt-x', `${((y - 0.5) * -5).toFixed(2)}deg`);
        landing.style.setProperty('--pb-tilt-y', `${((x - 0.5) * 5).toFixed(2)}deg`);
      }, { passive: true });
    }
  });
})();
