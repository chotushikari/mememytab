const MARK = "mememytab-photo";
let active = false;
let photos = [];
let previous = -1;
let queued = false;
const defaults = () => [chrome.runtime.getURL("assets/starter/manas-1.jpg"), chrome.runtime.getURL("assets/starter/manas-2.jpg")];
const choose = () => { if (photos.length < 2) return photos[0]; let i; do i = Math.floor(Math.random() * photos.length); while (i === previous); previous = i; return photos[i]; };
function visible(el) { const r = el.getBoundingClientRect(); return r.width >= 8 && r.height >= 8 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth; }
function pop(el) { el.classList.remove("mememytab-pop"); void el.offsetWidth; el.classList.add("mememytab-pop"); }
function swap(img) {
  if (!active || img.classList.contains(MARK) || img.dataset.mememytabPending || !visible(img)) return;
  img.dataset.mememytabPending = "1";
  const next = choose(), preload = new Image();
  preload.onload = () => { if (!active || !img.isConnected) return; img.dataset.mememytabOriginal = img.currentSrc || img.src; img.dataset.mememytabSrcset = img.getAttribute("srcset") || ""; img.removeAttribute("srcset"); img.removeAttribute("sizes"); img.src = next; img.classList.add(MARK); img.style.setProperty("object-fit", "cover", "important"); img.style.setProperty("outline", "2px solid #ff5f8f", "important"); img.style.setProperty("outline-offset", "-2px", "important"); delete img.dataset.mememytabPending; pop(img); };
  preload.onerror = () => delete img.dataset.mememytabPending;
  preload.src = next;
}
function swapBackground(el) { if (!active || el.dataset.mememytabBackground || !visible(el) || getComputedStyle(el).backgroundImage === "none") return; el.dataset.mememytabBackground = "1"; el.style.setProperty("background-image", `url("${choose()}")`, "important"); el.style.setProperty("background-size", "cover", "important"); el.style.setProperty("background-position", "center", "important"); pop(el); }
function scan() { document.images.forEach((img, i) => setTimeout(() => swap(img), Math.min(i * 22, 220))); document.querySelectorAll('[style*="background-image"], [style*="background:"]').forEach(swapBackground); }
function restore() { document.querySelectorAll(`img.${MARK}`).forEach((img) => { img.src = img.dataset.mememytabOriginal || ""; if (img.dataset.mememytabSrcset) img.setAttribute("srcset", img.dataset.mememytabSrcset); img.classList.remove(MARK); img.style.removeProperty("object-fit"); img.style.removeProperty("outline"); img.style.removeProperty("outline-offset"); delete img.dataset.mememytabOriginal; delete img.dataset.mememytabSrcset; }); document.querySelectorAll("[data-mememytab-background]").forEach((el) => { el.style.removeProperty("background-image"); el.style.removeProperty("background-size"); el.style.removeProperty("background-position"); delete el.dataset.mememytabBackground; }); }
function setState(on, deck) { active = on; photos = deck?.length ? deck : defaults(); previous = -1; if (active) scan(); else restore(); }
function schedule() { if (!active || queued) return; queued = true; requestAnimationFrame(() => { queued = false; scan(); }); }
const style = document.createElement("style"); style.textContent = "@keyframes mememytab-pop{0%{opacity:.2;transform:scale(.88) rotate(-2deg)}65%{opacity:1;transform:scale(1.035) rotate(1deg)}100%{transform:scale(1) rotate(0)}}.mememytab-pop{animation:mememytab-pop .34s cubic-bezier(.18,.9,.25,1.2) both!important}"; document.documentElement.append(style);
chrome.runtime.onMessage.addListener((m, _s, reply) => { if (m.type === "MEME_MY_TAB") { setState(m.enabled, m.photos); reply({ ok: true }); } });
chrome.storage.local.get({ mememytabEnabled: false, mememytabPhotos: [] }, (s) => setState(s.mememytabEnabled, s.mememytabPhotos));
new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
addEventListener("scroll", schedule, true); addEventListener("resize", schedule); addEventListener("load", schedule, true);
