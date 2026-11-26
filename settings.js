(() => {
  // ====== CẤU HÌNH ======
  const MUSIC_SRC = 'callofsilence.mp3';   // đổi tên file nhạc ở đây
  const MUSIC_NAME = 'Call of Silence';    // tên bài hiển thị
  const ENABLE_DARK = false;               // giữ false vì web đã có nút 🌙 ở thanh menu
  const GAP = 55, SPREAD = 9;              // độ thưa và độ lệch của dấu chân

  const touch = matchMedia('(pointer: coarse)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canPaws = !touch && !reduce;

  const get = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (e) { return d; } };
  const set = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const sget = (k) => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
  const sset = (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} };

  // ====== CSS của bảng cài đặt ======
  const style = document.createElement('style');
  style.textContent = `
    .av-gear{position:fixed;right:20px;bottom:20px;z-index:9999;width:46px;height:46px;border-radius:50%;
      border:2px solid #293b2d;background:#d2c3a5;color:#1d2d22;cursor:pointer;display:grid;place-items:center;
      box-shadow:0 0 0 3px #f0e9dc,0 6px 20px rgba(0,0,0,.35);transition:transform .35s}
    .av-gear:hover{transform:rotate(60deg) scale(1.08)}
    .av-panel{position:fixed;right:20px;bottom:84px;z-index:9999;width:240px;padding:16px;border-radius:18px;
      background:rgba(29,45,34,.97);color:#f0e9dc;font:500 13px/1.4 var(--sans,system-ui,sans-serif);
      box-shadow:0 12px 40px rgba(0,0,0,.4);opacity:0;transform:translateY(8px);pointer-events:none;
      transition:opacity .2s,transform .2s}
    .av-panel.open{opacity:1;transform:none;pointer-events:auto}
    .av-panel h4{margin:0 0 10px;font-size:11px;letter-spacing:2px;color:#b9a88b;font-weight:600}
    .av-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;
      border-top:1px solid rgba(240,233,220,.12)}
    .av-row small{display:block;color:#b9a88b;font-size:11px}
    .av-sw{flex:none;width:40px;height:22px;border-radius:50px;border:none;background:rgba(240,233,220,.25);
      position:relative;cursor:pointer;transition:background .2s}
    .av-sw::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;
      background:#f0e9dc;transition:transform .2s}
    .av-sw[aria-checked="true"]{background:#7d9a6b}
    .av-sw[aria-checked="true"]::after{transform:translateX(18px)}`;
  document.head.appendChild(style);

  // ====== Nút bánh răng + bảng ======
  const gear = document.createElement('button');
  gear.type = 'button';
  gear.className = 'av-gear';
  gear.setAttribute('aria-label', 'Mở cài đặt');
  gear.setAttribute('aria-expanded', 'false');
  gear.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>';

  const panel = document.createElement('div');
  panel.className = 'av-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Cài đặt');
  panel.innerHTML = '<h4>CÀI ĐẶT</h4>';

  const addRow = (label, sub, onToggle, initial) => {
    const row = document.createElement('div');
    row.className = 'av-row';
    const text = document.createElement('div');
    text.innerHTML = label + (sub ? '<small>' + sub + '</small>' : '');
    const sw = document.createElement('button');
    sw.type = 'button';
    sw.className = 'av-sw';
    sw.setAttribute('role', 'switch');
    sw.setAttribute('aria-checked', String(initial));
    sw.addEventListener('click', () => {
      const next = sw.getAttribute('aria-checked') !== 'true';
      sw.setAttribute('aria-checked', String(next));
      onToggle(next);
    });
    row.append(text, sw);
    panel.appendChild(row);
    return sw;
  };

  // ====== 1. Nhạc nền ======
  const music = new Audio(MUSIC_SRC);
  music.loop = true;
  music.volume = 0.5;
  music.preload = 'none';

  const savedTime = parseFloat(sget('avaria_music_time'));
  if (!isNaN(savedTime)) music.addEventListener('loadedmetadata', () => { music.currentTime = savedTime; }, { once: true });

  const musicSw = addRow('♪ Nhạc nền', MUSIC_NAME, (on) => {
    if (on) { music.play().catch(() => musicSw.setAttribute('aria-checked', 'false')); sset('avaria_music_playing', 'true'); }
    else { music.pause(); sset('avaria_music_playing', 'false'); }
  }, false);

  if (sget('avaria_music_playing') === 'true') {
    music.play().then(() => musicSw.setAttribute('aria-checked', 'true')).catch(() => {
      // Trình duyệt chặn tự phát: chờ cú click đầu tiên của khách
      document.addEventListener('click', () => {
        if (sget('avaria_music_playing') === 'true' && music.paused) {
          music.play().then(() => musicSw.setAttribute('aria-checked', 'true')).catch(() => {});
        }
      }, { once: true });
    });
  }
  window.addEventListener('beforeunload', () => {
    sset('avaria_music_time', String(music.currentTime));
    sset('avaria_music_playing', String(!music.paused));
  });

  // ====== 2. Dấu chân (chỉ hiện trên máy có chuột) ======
  let pawsOn = get('avaria_paws', 'on') !== 'off';
  if (canPaws) {
    addRow('🐾 Dấu chân', 'Theo con trỏ chuột', (on) => { pawsOn = on; set('avaria_paws', on ? 'on' : 'off'); }, pawsOn);

    let lastX = null, lastY = null, left = true;
    document.addEventListener('mousemove', (e) => {
      if (!pawsOn) { lastX = null; return; }
      if (lastX === null) { lastX = e.clientX; lastY = e.clientY; return; }
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      const dist = Math.hypot(dx, dy);
      if (dist < GAP) return;
      const angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
      const nx = -dy / dist, ny = dx / dist;
      const side = left ? -SPREAD : SPREAD;
      left = !left;
      const paw = document.createElement('span');
      paw.className = 'paw-trail';
      paw.style.left = (e.clientX + nx * side) + 'px';
      paw.style.top = (e.clientY + ny * side) + 'px';
      paw.style.setProperty('--a', angle + 'deg');
      paw.addEventListener('animationend', () => paw.remove());
      document.body.appendChild(paw);
      lastX = e.clientX; lastY = e.clientY;
    });
  }

  // ====== 3. Chế độ tối ======
  if (ENABLE_DARK) {
    const dark = get('avaria_dark', 'off') === 'on';
    document.body.classList.toggle('dark-mode', dark);
    addRow('☾ Chế độ tối', '', (on) => {
      document.body.classList.toggle('dark-mode', on);
      set('avaria_dark', on ? 'on' : 'off');
    }, dark);
  }

  // ====== Mở/đóng bảng ======
  const close = () => { panel.classList.remove('open'); gear.setAttribute('aria-expanded', 'false'); };
  gear.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = panel.classList.toggle('open');
    gear.setAttribute('aria-expanded', String(open));
  });
  panel.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  document.body.append(panel, gear);
})();