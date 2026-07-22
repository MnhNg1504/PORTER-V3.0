/**
 * BỘ ICON PORTER — tuân thủ Porter Brand Guidelines mục "Bảng icon UI · 28 icon":
 * "Phong cách nét mảnh (outline), grid 24px, stroke 1.6px, bo tròn đầu nét.
 *  Dùng màu pine trên nền sáng, cream/lime trên nền tối."
 * (Kit gốc chỉ có quy tắc, chưa kèm file icon — bộ này tạo mới theo đúng quy tắc đó.)
 *
 * 2 dạng dùng:
 * 1. ICON UI (outline, currentColor): <svg class="pico" style="color:#16281A"><use href="#ic-camp"/></svg>
 * 2. PIN MARKER (đầu tròn màu brand như ảnh mẫu Route covered): <use href="#pin-camp"/>
 *    — pin = nền tròn màu semantic + glyph outline 1.6px bên trong.
 * Màu semantic: Mist #A9CDD8 trại/nước · Ember #FF5233 cảnh báo · Lime #C9E265 checkpoint/hành động
 * · Cream #EAF1E4 trung tính · nét glyph Pine #16281A.
 */
(function(){
// Glyph outline thuần (grid 24, stroke 1.6, round cap/join, dùng currentColor)
const G={
  camp:'<path d="M12 5.5 L19 18.5 H5 Z" fill="none"/><path d="M12 9.5 L14.8 18.5 M12 9.5 L9.2 18.5" fill="none"/>',
  warn:'<circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4 M16.2 7.8a6 6 0 0 1 0 8.4" fill="none"/>',
  check:'<path d="M9 12.7V8.9a1 1 0 0 1 2 0v2.6 M11 11.5V7a1 1 0 0 1 2 0v4.5 M13 11.5V7.7a1 1 0 0 1 2 0v4.2 M15 12.1v-2.2a1 1 0 0 1 2 0v4.5c0 2.9-1.8 4.7-4.5 4.7-2.3 0-3.5-1.1-4.7-3l-1.2-2a1 1 0 0 1 1.7-1.1l.9 1.3" fill="none"/>',
  water:'<path d="M12 5.5c2.8 3.6 4.5 5.9 4.5 8.1a4.5 4.5 0 0 1-9 0c0-2.2 1.7-4.5 4.5-8.1Z" fill="none"/>',
  summit:'<path d="M9.5 19V5.8 M9.5 6.2h6.6l-2 2.5 2 2.5H9.5" fill="none"/>',
  photo:'<rect x="5.7" y="8.5" width="12.6" height="9.3" rx="2" fill="none"/><path d="M9 8.5l1.4-2.1h3.2L15 8.5" fill="none"/><circle cx="12" cy="13" r="2.6" fill="none"/>',
  guide:'<circle cx="12" cy="9" r="2.8" fill="none"/><path d="M6.8 18.5c1-3.1 2.9-4.4 5.2-4.4s4.2 1.3 5.2 4.4" fill="none"/>',
  s:'<text x="12" y="16.3" text-anchor="middle" font-family="Segoe UI,Arial" font-size="11.5" font-weight="700" fill="currentColor" stroke="none">S</text>',
  f:'<text x="12" y="16.3" text-anchor="middle" font-family="Segoe UI,Arial" font-size="11.5" font-weight="700" fill="currentColor" stroke="none">F</text>',
  e:'<text x="12" y="16.3" text-anchor="middle" font-family="Segoe UI,Arial" font-size="11.5" font-weight="700" fill="currentColor" stroke="none">E</text>',
};
// Nền pin theo semantic (đầu tròn phẳng như ảnh mẫu)
const BG={camp:'#A9CDD8',warn:'#FF5233',check:'#C9E265',water:'#A9CDD8',summit:'#EAF1E4',
  photo:'#EAF1E4',guide:'#C9E265',s:'#EAF1E4',f:'#EAF1E4',e:'#EAF1E4'};
// Màu glyph trên nền pin: Ember dùng nét cream cho tương phản, còn lại nét Pine
const FG={warn:'#EAF1E4'};

let sym='';
for(const k in G){
  const stroke=`stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"`;
  // Icon UI outline (currentColor — pine trên nền sáng, cream/lime trên nền tối)
  sym+=`<symbol id="ic-${k}" viewBox="0 0 24 24"><g ${stroke}>${G[k]}</g></symbol>`;
  // Pin marker: nền tròn màu + glyph
  sym+=`<symbol id="pin-${k}" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="11.2" fill="${BG[k]}"/>
    <g color="${FG[k]??'#16281A'}" ${stroke}>${G[k].replace(/currentColor/g,FG[k]??'#16281A')}</g>
  </symbol>`;
}
const SPRITE=`<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">${sym}</svg>`;
function inject(){
  const div=document.createElement('div');
  div.innerHTML=SPRITE;
  document.body.insertBefore(div.firstElementChild,document.body.firstChild);
}
if(document.body)inject();else addEventListener('DOMContentLoaded',inject);
})();
