/**
 * BỘ ICON PORTER — tạo mới theo bộ nhận diện (kit gốc chưa có icon).
 * Phong cách: đầu pin tròn phẳng tối giản như ảnh mẫu "Route covered",
 * màu semantic thương hiệu: Mist #A9CDD8 (trại/nước) · Ember #FF5233 (cảnh báo)
 * · Lime #C9E265 (checkpoint/hành động) · Cream #EAF1E4 (trung tính) · Pine #16281A (nét).
 * Dùng: nạp file này -> sprite SVG ẩn được chèn vào <body>;
 * vẽ icon bằng: <svg class="pico"><use href="#pin-camp"/></svg>
 * (head-only 32×32 — thân pin/stem do nơi dùng tự vẽ, giống ảnh mẫu).
 */
(function(){
const SPRITE=`
<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">
  <!-- Trại/cắm trại — Mist, glyph lều -->
  <symbol id="pin-camp" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="15" fill="#A9CDD8"/>
    <path d="M16 9 L24 22 H8 Z" fill="none" stroke="#16281A" stroke-width="2" stroke-linejoin="round"/>
    <path d="M16 13 L19.5 22 M16 13 L12.5 22" stroke="#16281A" stroke-width="1.6"/>
  </symbol>
  <!-- Cảnh báo/nguy hiểm — Ember, glyph sóng tín hiệu (o) -->
  <symbol id="pin-warn" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="15" fill="#FF5233"/>
    <circle cx="16" cy="16" r="3" fill="#fff"/>
    <path d="M10.5 10.5a8 8 0 0 0 0 11 M21.5 10.5a8 8 0 0 1 0 11" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
  </symbol>
  <!-- Checkpoint xác minh — Lime, glyph bàn tay high-five -->
  <symbol id="pin-check" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="15" fill="#C9E265"/>
    <path d="M12 17v-5.2a1.3 1.3 0 0 1 2.6 0V15 M14.6 15v-6a1.3 1.3 0 0 1 2.6 0v6 M17.2 15v-5a1.3 1.3 0 0 1 2.6 0v5.6 M19.8 15.8v-3a1.3 1.3 0 0 1 2.6 0v6c0 3.8-2.4 6.2-6 6.2-3 0-4.6-1.4-6.2-4l-1.6-2.7a1.35 1.35 0 0 1 2.3-1.4l1.1 1.7"
      fill="none" stroke="#16281A" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
  </symbol>
  <!-- Nguồn nước — Mist, glyph giọt -->
  <symbol id="pin-water" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="15" fill="#A9CDD8"/>
    <path d="M16 8c3.6 4.6 5.8 7.6 5.8 10.4a5.8 5.8 0 0 1-11.6 0C10.2 15.6 12.4 12.6 16 8Z"
      fill="none" stroke="#16281A" stroke-width="2" stroke-linejoin="round"/>
  </symbol>
  <!-- Đỉnh núi — Cream, glyph cờ -->
  <symbol id="pin-summit" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="15" fill="#EAF1E4"/>
    <path d="M13 24V8.5 M13 9h8l-2.4 3 2.4 3h-8" fill="none" stroke="#16281A" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
  </symbol>
  <!-- Chụp ảnh checkpoint — Cream, glyph máy ảnh -->
  <symbol id="pin-photo" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="15" fill="#EAF1E4"/>
    <rect x="8.5" y="12" width="15" height="11" rx="2.4" fill="none" stroke="#16281A" stroke-width="2"/>
    <path d="M12.5 12l1.6-2.5h3.8L19.5 12" fill="none" stroke="#16281A" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="16" cy="17.4" r="3.2" fill="none" stroke="#16281A" stroke-width="2"/>
  </symbol>
  <!-- Điểm S / F / E — Cream, chữ Pine (Start/Finish/End-exit) -->
  <symbol id="pin-s" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="15" fill="#EAF1E4"/>
    <text x="16" y="21.5" text-anchor="middle" font-family="Segoe UI,Arial" font-size="15" font-weight="800" fill="#16281A">S</text>
  </symbol>
  <symbol id="pin-f" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="15" fill="#EAF1E4"/>
    <text x="16" y="21.5" text-anchor="middle" font-family="Segoe UI,Arial" font-size="15" font-weight="800" fill="#16281A">F</text>
  </symbol>
  <symbol id="pin-e" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="15" fill="#EAF1E4"/>
    <text x="16" y="21.5" text-anchor="middle" font-family="Segoe UI,Arial" font-size="15" font-weight="800" fill="#16281A">E</text>
  </symbol>
  <!-- Guide/đoàn — Lime, glyph người -->
  <symbol id="pin-guide" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="15" fill="#C9E265"/>
    <circle cx="16" cy="12.5" r="3.6" fill="none" stroke="#16281A" stroke-width="2"/>
    <path d="M9.5 23.5c1.2-4 3.6-5.5 6.5-5.5s5.3 1.5 6.5 5.5" fill="none" stroke="#16281A" stroke-width="2" stroke-linecap="round"/>
  </symbol>
</svg>`;
  function inject(){
    const div=document.createElement('div');
    div.innerHTML=SPRITE;
    document.body.insertBefore(div.firstElementChild,document.body.firstChild);
  }
  if(document.body)inject();else addEventListener('DOMContentLoaded',inject);
})();
