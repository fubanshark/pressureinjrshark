const menuTrack = document.getElementById("menuTrack");
const menuWrap = document.getElementById("menuWrap");
const menuPrev = document.getElementById("menuPrev");
const menuNext = document.getElementById("menuNext");
const menuBar = document.getElementById("menuBar");
const menuThumb = document.getElementById("menuThumb");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== อัปเดตแถบเทาและเฟดขอบ ตามตำแหน่งที่เลื่อน =====
function updateMenu() {
  const maxScroll = menuTrack.scrollWidth - menuTrack.clientWidth;
  const trackW = menuBar.clientWidth;

  // ไม่ต้องเลื่อน (เนื้อหาพอดีจอ): ซ่อนแถบ
  menuBar.style.visibility = maxScroll > 0 ? "visible" : "hidden";

  const thumbW = Math.max(trackW * (menuTrack.clientWidth / menuTrack.scrollWidth), 40);
  const progress = maxScroll > 0 ? menuTrack.scrollLeft / maxScroll : 0;
  menuThumb.style.width = thumbW + "px";
  menuThumb.style.left = (trackW - thumbW) * progress + "px";

  menuWrap.classList.toggle("is-start", menuTrack.scrollLeft <= 4);
  menuWrap.classList.toggle("is-end", menuTrack.scrollLeft >= maxScroll - 4);
}

menuTrack.addEventListener("scroll", updateMenu, { passive: true });
window.addEventListener("resize", updateMenu);
window.addEventListener("load", updateMenu);
updateMenu();

// ===== ปุ่มลูกศร =====
function scrollMenu(direction) {
  menuTrack.scrollBy({
    left: direction * menuTrack.clientWidth * 0.8,
    behavior: reduceMotion ? "auto" : "smooth"
  });
}
menuPrev.addEventListener("click", function () { scrollMenu(-1); });
menuNext.addEventListener("click", function () { scrollMenu(1); });

// ===== ลากแถบเทา =====
let dragging = false;
let startX = 0;
let startScroll = 0;

menuThumb.addEventListener("pointerdown", function (e) {
  dragging = true;
  startX = e.clientX;
  startScroll = menuTrack.scrollLeft;
  menuTrack.style.scrollSnapType = "none";   // ปิดการดูดเข้าที่ระหว่างลาก
  menuBar.classList.add("dragging");
  menuThumb.setPointerCapture(e.pointerId);
  e.preventDefault();
});

menuThumb.addEventListener("pointermove", function (e) {
  if (!dragging) {
    return;
  }
  const maxScroll = menuTrack.scrollWidth - menuTrack.clientWidth;
  const movable = menuBar.clientWidth - menuThumb.offsetWidth;
  if (movable <= 0) {
    return;
  }
  menuTrack.scrollLeft = startScroll + (e.clientX - startX) * (maxScroll / movable);
});

function endDrag() {
  dragging = false;
  menuTrack.style.scrollSnapType = "";
  menuBar.classList.remove("dragging");
}
menuThumb.addEventListener("pointerup", endDrag);
menuThumb.addEventListener("pointercancel", endDrag);

// ===== คลิกที่ราง (ไม่ใช่ตัวแถบ) เพื่อกระโดดไปตำแหน่งนั้น =====
menuBar.addEventListener("pointerdown", function (e) {
  if (e.target === menuThumb) {
    return;
  }
  const rect = menuBar.getBoundingClientRect();
  const maxScroll = menuTrack.scrollWidth - menuTrack.clientWidth;
  const movable = rect.width - menuThumb.offsetWidth;
  if (movable <= 0) {
    return;
  }
  const x = Math.min(Math.max(e.clientX - rect.left - menuThumb.offsetWidth / 2, 0), movable);
  menuTrack.scrollTo({
    left: (x / movable) * maxScroll,
    behavior: reduceMotion ? "auto" : "smooth"
  });
});