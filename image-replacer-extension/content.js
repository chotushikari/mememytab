const MARK = "mememytab-photo";
const VIDEO_MARK = "mememytab-video";
let active = false, photos = [], mode = "super", previous = -1, queued = false, faceDetector = null, faceDetectorChecked = false;
const faceCache = new Map();
const defaults = () => [chrome.runtime.getURL("assets/starter/manas-1.jpg"), chrome.runtime.getURL("assets/starter/manas-2.jpg")];
const choose = () => { if (photos.length < 2) return photos[0]; let i; do i = Math.floor(Math.random() * photos.length); while (i === previous); previous = i; return photos[i]; };
function visible(el) { const r = el.getBoundingClientRect(); return r.width >= 8 && r.height >= 8 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth; }
function pop(el) { el.classList.remove("mememytab-reveal"); void el.offsetWidth; el.classList.add("mememytab-reveal"); }

// Same free browser API used by the original project. It detects a face box; it does not send images anywhere.
function getFaceDetector() {
  if (faceDetectorChecked) return faceDetector;
  faceDetectorChecked = true;
  if (!("FaceDetector" in window)) return null;
  try { faceDetector = new FaceDetector({ maxDetectedFaces: 8, fastMode: true }); } catch { faceDetector = null; }
  return faceDetector;
}
async function detectFaces(img) {
  const source = img.currentSrc || img.src || "";
  if (!source) return [];
  if (faceCache.has(source)) return faceCache.get(source);
  const detector = getFaceDetector();
  if (!detector || !img.naturalWidth || !img.naturalHeight) return [];
  try {
    const bitmap = await createImageBitmap(img);
    const faces = await detector.detect(bitmap);
    bitmap.close?.();
    faceCache.set(source, faces);
    return faces;
  } catch { return []; }
}
function faceRect(img, box) {
  const r = img.getBoundingClientRect(), naturalW = img.naturalWidth, naturalH = img.naturalHeight;
  if (!naturalW || !naturalH) return null;
  const objectFit = getComputedStyle(img).objectFit || "fill";
  let scaleX = r.width / naturalW, scaleY = r.height / naturalH, offsetX = 0, offsetY = 0;
  if (objectFit === "cover" || objectFit === "contain") {
    const scale = objectFit === "cover" ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
    scaleX = scaleY = scale; offsetX = (r.width - naturalW * scale) / 2; offsetY = (r.height - naturalH * scale) / 2;
  }
  const size = Math.max(box.width * scaleX, box.height * scaleY) * 1.35;
  return { left: r.left + offsetX + box.x * scaleX + (box.width * scaleX - size) / 2, top: r.top + offsetY + box.y * scaleY + (box.height * scaleY - size) / 2, size };
}
function positionFace(overlay) {
  const rect = faceRect(overlay._memeImage, overlay._memeBox);
  if (!rect || !visible(overlay._memeImage)) { overlay.remove(); return; }
  overlay.style.left = `${rect.left}px`; overlay.style.top = `${rect.top}px`; overlay.style.width = `${rect.size}px`; overlay.style.height = `${rect.size}px`;
}
async function swapFaces(img) {
  if (!active || mode !== "faces" || img.dataset.mememytabFacePending || img.dataset.mememytabFaceChecked || !visible(img) || img.naturalWidth < 80 || img.naturalHeight < 80) return;
  img.dataset.mememytabFacePending = "1";
  const faces = await detectFaces(img);
  delete img.dataset.mememytabFacePending; img.dataset.mememytabFaceChecked = "1";
  if (!active || mode !== "faces" || !img.isConnected || !faces.length) return;
  faces.forEach(face => {
    const overlay = document.createElement("div");
    overlay.dataset.mememytabFace = "1"; overlay._memeImage = img; overlay._memeBox = face.boundingBox;
    overlay.style.cssText = `position:fixed!important;z-index:2147483646!important;pointer-events:none!important;border-radius:50%!important;background:#171922 url("${choose()}") center 22%/cover no-repeat!important;box-shadow:0 0 0 2px rgba(255,95,143,.9),0 3px 12px rgba(0,0,0,.28)!important;`;
    document.documentElement.append(overlay); positionFace(overlay); pop(overlay);
  });
}
function swap(img) {
  if (!active || img.classList.contains(MARK) || img.dataset.mememytabPending || !visible(img)) return;
  img.dataset.mememytabPending = "1";
  const next = choose(), preload = new Image();
  preload.onload = () => { if (!active || !img.isConnected) return; img.dataset.mememytabOriginal = img.currentSrc || img.src; img.dataset.mememytabSrcset = img.getAttribute("srcset") || ""; img.removeAttribute("srcset"); img.removeAttribute("sizes"); img.src = next; img.classList.add(MARK); img.style.setProperty("object-fit", "cover", "important"); img.style.setProperty("outline", "2px solid #ff5f8f", "important"); img.style.setProperty("outline-offset", "-2px", "important"); delete img.dataset.mememytabPending; pop(img); };
  preload.onerror = () => delete img.dataset.mememytabPending; preload.src = next;
}
function swapBackground(el) { if (!active || mode !== "super" || el.dataset.mememytabBackground || !visible(el) || getComputedStyle(el).backgroundImage === "none") return; el.dataset.mememytabBackground = "1"; el.style.setProperty("background-image", `url("${choose()}")`, "important"); el.style.setProperty("background-size", "cover", "important"); el.style.setProperty("background-position", "center", "important"); pop(el); }
function coverVideo(video) { if (!active || mode !== "super" || video.dataset.mememytabCovered || !visible(video)) return; const parent = video.parentElement; if (!parent) return; if (getComputedStyle(parent).position === "static") parent.style.setProperty("position", "relative", "important"); const overlay = document.createElement("div"); overlay.className = VIDEO_MARK; overlay.dataset.mememytabOverlay = "1"; overlay.style.cssText = `position:absolute!important;inset:0!important;z-index:2147483646!important;background:#191b22 url("${choose()}") center/cover no-repeat!important;pointer-events:none!important;border:2px solid #ff5f8f!important;`; parent.append(overlay); video.dataset.mememytabCovered = "1"; pop(overlay); }
function scan() {
  if (mode === "faces") { Array.from(document.images).forEach((img, i) => setTimeout(() => swapFaces(img), Math.min(i * 16, 180))); document.querySelectorAll("[data-mememytab-face]").forEach(positionFace); return; }
  Array.from(document.images).forEach((img, i) => setTimeout(() => swap(img), Math.min(i * 18, 180))); document.querySelectorAll('[style*="background-image"], [style*="background:"]').forEach(swapBackground); document.querySelectorAll("video").forEach(coverVideo);
}
function restore() {
  document.querySelectorAll(`img.${MARK}`).forEach(img => { img.src = img.dataset.mememytabOriginal || ""; if (img.dataset.mememytabSrcset) img.setAttribute("srcset", img.dataset.mememytabSrcset); img.classList.remove(MARK, "mememytab-reveal"); img.style.removeProperty("object-fit"); img.style.removeProperty("outline"); img.style.removeProperty("outline-offset"); delete img.dataset.mememytabOriginal; delete img.dataset.mememytabSrcset; });
  document.querySelectorAll("[data-mememytab-background]").forEach(el => { el.style.removeProperty("background-image"); el.style.removeProperty("background-size"); el.style.removeProperty("background-position"); delete el.dataset.mememytabBackground; }); document.querySelectorAll("[data-mememytab-overlay], [data-mememytab-face]").forEach(el => el.remove()); document.querySelectorAll("video[data-mememytab-covered]").forEach(video => delete video.dataset.mememytabCovered); document.querySelectorAll("img[data-mememytab-face-checked]").forEach(img => delete img.dataset.mememytabFaceChecked);
}
function setState(on, deck, nextMode = "super") { restore(); active = on; photos = deck?.length ? deck : defaults(); mode = nextMode === "faces" ? "faces" : "super"; previous = -1; if (active) scan(); }
function schedule() { if (!active || queued) return; queued = true; requestAnimationFrame(() => { queued = false; scan(); }); }
const style = document.createElement("style"); style.textContent = "@keyframes mememytab-reveal{from{opacity:.15;transform:scale(.985)}to{opacity:1;transform:scale(1)}}.mememytab-reveal{animation:mememytab-reveal .16s ease-out both!important}"; document.documentElement.append(style);
chrome.runtime.onMessage.addListener((m, _s, reply) => { if (m.type === "MEME_MY_TAB") { setState(m.enabled, m.photos, m.mode); reply({ ok: true, faceDetectionAvailable: !!getFaceDetector() }); } });
chrome.storage.local.get({ mememytabEnabled: false, mememytabPhotos: [], mememytabMode: "super" }, s => setState(s.mememytabEnabled, s.mememytabPhotos, s.mememytabMode));
new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true }); addEventListener("scroll", schedule, true); addEventListener("resize", schedule); addEventListener("load", schedule, true);
