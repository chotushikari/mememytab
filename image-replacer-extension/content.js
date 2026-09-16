const MARK = "mememytab-photo";
const VIDEO_MARK = "mememytab-video";
let active = false, photos = [], mode = "super", previous = -1, queued = false;
const defaults = () => [chrome.runtime.getURL("assets/starter/manas-1.jpg"), chrome.runtime.getURL("assets/starter/manas-2.jpg")];
const choose = () => { if (photos.length < 2) return photos[0]; let i; do i = Math.floor(Math.random() * photos.length); while (i === previous); previous = i; return photos[i]; };
function visible(el) { const r = el.getBoundingClientRect(); return r.width >= 8 && r.height >= 8 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth; }
function isFaceLike(img) { const r = img.getBoundingClientRect(), ratio = r.width / Math.max(r.height, 1), hint = `${img.alt || ""} ${img.className || ""} ${img.id || ""}`.toLowerCase(); return /avatar|profile|user|author|actor|person|photo|dp/.test(hint) || (r.width <= 180 && r.height <= 180 && ratio > .65 && ratio < 1.45); }
function pop(el) { el.classList.remove("mememytab-pop"); void el.offsetWidth; el.classList.add("mememytab-pop"); }
function swap(img) {
  if (!active || img.classList.contains(MARK) || img.dataset.mememytabPending || !visible(img) || (mode === "faces" && !isFaceLike(img))) return;
  img.dataset.mememytabPending = "1";
  const next = choose(), preload = new Image();
  preload.onload = () => { if (!active || !img.isConnected) return; img.dataset.mememytabOriginal = img.currentSrc || img.src; img.dataset.mememytabSrcset = img.getAttribute("srcset") || ""; img.removeAttribute("srcset"); img.removeAttribute("sizes"); img.src = next; img.classList.add(MARK); img.style.setProperty("object-fit", "cover", "important"); img.style.setProperty("outline", "2px solid #ff5f8f", "important"); img.style.setProperty("outline-offset", "-2px", "important"); delete img.dataset.mememytabPending; pop(img); };
  preload.onerror = () => delete img.dataset.mememytabPending; preload.src = next;
}
function swapBackground(el) { if (!active || mode !== "super" || el.dataset.mememytabBackground || !visible(el) || getComputedStyle(el).backgroundImage === "none") return; el.dataset.mememytabBackground = "1"; el.style.setProperty("background-image", `url("${choose()}")`, "important"); el.style.setProperty("background-size", "cover", "important"); el.style.setProperty("background-position", "center", "important"); pop(el); }
function coverVideo(video) {
  if (!active || mode !== "super" || video.dataset.mememytabCovered || !visible(video)) return;
  const parent = video.parentElement; if (!parent) return;
  const parentStyle = getComputedStyle(parent); if (parentStyle.position === "static") parent.style.setProperty("position", "relative", "important");
  const overlay = document.createElement("div"); overlay.className = VIDEO_MARK; overlay.dataset.mememytabOverlay = "1"; overlay.style.cssText = `position:absolute!important;inset:0!important;z-index:2147483646!important;background:#191b22 url("${choose()}") center/cover no-repeat!important;pointer-events:none!important;border:2px solid #ff5f8f!important;`;
  parent.append(overlay); video.dataset.mememytabCovered = "1"; pop(overlay);
}
function scan() { Array.from(document.images).forEach((img, i) => setTimeout(() => swap(img), Math.min(i * 18, 180))); if (mode === "super") { document.querySelectorAll('[style*="background-image"], [style*="background:"]').forEach(swapBackground); document.querySelectorAll("video").forEach(coverVideo); } }
function restore() {
  document.querySelectorAll(`img.${MARK}`).forEach(img => { img.src = img.dataset.mememytabOriginal || ""; if (img.dataset.mememytabSrcset) img.setAttribute("srcset", img.dataset.mememytabSrcset); img.classList.remove(MARK); img.style.removeProperty("object-fit"); img.style.removeProperty("outline"); img.style.removeProperty("outline-offset"); delete img.dataset.mememytabOriginal; delete img.dataset.mememytabSrcset; });
  document.querySelectorAll("[data-mememytab-background]").forEach(el => { el.style.removeProperty("background-image"); el.style.removeProperty("background-size"); el.style.removeProperty("background-position"); delete el.dataset.mememytabBackground; });
  document.querySelectorAll("[data-mememytab-overlay]").forEach(el => el.remove()); document.querySelectorAll("video[data-mememytab-covered]").forEach(video => delete video.dataset.mememytabCovered);
}
function setState(on, deck, nextMode = "super") { restore(); active = on; photos = deck?.length ? deck : defaults(); mode = nextMode === "faces" ? "faces" : "super"; previous = -1; if (active) scan(); }
function schedule() { if (!active || queued) return; queued = true; requestAnimationFrame(() => { queued = false; scan(); }); }
const style = document.createElement("style"); style.textContent = "@keyframes mememytab-pop{0%{opacity:.2;transform:scale(.88) rotate(-2deg)}65%{opacity:1;transform:scale(1.035) rotate(1deg)}100%{transform:scale(1) rotate(0)}}.mememytab-pop{animation:mememytab-pop .28s cubic-bezier(.18,.9,.25,1.2) both!important}"; document.documentElement.append(style);
chrome.runtime.onMessage.addListener((m, _s, reply) => { if (m.type === "MEME_MY_TAB") { setState(m.enabled, m.photos, m.mode); reply({ ok: true }); } });
chrome.storage.local.get({ mememytabEnabled: false, mememytabPhotos: [], mememytabMode: "super" }, s => setState(s.mememytabEnabled, s.mememytabPhotos, s.mememytabMode));
new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true }); addEventListener("scroll", schedule, true); addEventListener("resize", schedule); addEventListener("load", schedule, true);
