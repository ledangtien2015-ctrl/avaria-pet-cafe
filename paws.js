(() => {
  // Không chạy trên điện thoại (không có chuột) hoặc khi khách tắt hiệu ứng chuyển động
  if (matchMedia('(pointer: coarse)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const GAP = 55;        // khoảng cách giữa 2 dấu chân (px)
  const SPREAD = 9;      // độ lệch trái/phải
  const KEY = 'avaria_paws';

  // Đọc lựa chọn đã lưu (mặc định là bật)
  let enabled = true;
  try { enabled = localStorage.getItem(KEY) !== 'off'; } catch (e) {}

  // ---- Nút bật/tắt ở góc trái dưới ----
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Bật hoặc tắt hiệu ứng dấu chân');
  btn.style.cssText =
    'position:fixed;bottom:20px;left:20px;z-index:9999;width:46px;height:46px;' +
    'border:2px solid #293b2d;border-radius:50%;cursor:pointer;font-size:20px;line-height:1;' +
    'background:#d2c3a5;color:#1d2d22;' +
    'box-shadow:0 0 0 3px #f0e9dc,0 6px 20px rgba(0,0,0,.35);' +
    'display:grid;place-items:center;transition:transform .2s,background .25s;';
  btn.addEventListener('mouseenter', () => { btn.style.transform = 'scale(1.1)'; });
  btn.addEventListener('mouseleave', () => { btn.style.transform = 'scale(1)'; });
    btn.innerHTML =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">' +
    '<path d="M12 11.5c-3.2 0-6 3-6 5.8 0 2 1.6 3.2 3.4 3.2 1 0 1.8-.4 2.6-.4s1.6.4 2.6.4c1.8 0 3.4-1.2 3.4-3.2 0-2.8-2.8-5.8-6-5.8z"/>' +
    '<ellipse cx="4.2" cy="11" rx="2" ry="2.8" transform="rotate(-20 4.2 11)"/>' +
    '<ellipse cx="8.6" cy="5.8" rx="2.1" ry="3"/>' +
    '<ellipse cx="15.4" cy="5.8" rx="2.1" ry="3"/>' +
    '<ellipse cx="19.8" cy="11" rx="2" ry="2.8" transform="rotate(20 19.8 11)"/>' +
    '</svg>';

  const render = () => {
    btn.style.background = enabled ? '#d2c3a5' : '#293b2d';
    btn.style.color = enabled ? '#1d2d22' : '#d2c3a5';
    btn.style.opacity = enabled ? '1' : '.85';
    btn.title = enabled ? 'Tắt dấu chân' : 'Bật dấu chân';
    btn.setAttribute('aria-pressed', String(enabled));
  };
  render();

  btn.addEventListener('click', () => {
    enabled = !enabled;
    try { localStorage.setItem(KEY, enabled ? 'on' : 'off'); } catch (e) {}
    render();
  });
  document.body.appendChild(btn);

  // ---- Dấu chân theo chuột ----
  let lastX = null, lastY = null, left = true;

  document.addEventListener('mousemove', (e) => {
    if (!enabled) { lastX = null; return; }
    if (lastX === null) { lastX = e.clientX; lastY = e.clientY; return; }

    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
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

    lastX = e.clientX;
    lastY = e.clientY;
  });
})();