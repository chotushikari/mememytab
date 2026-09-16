const $ = s => document.querySelector(s);
const starter = ["assets/starter/manas-1.jpg", "assets/starter/manas-2.jpg"];
const toggle = $("#toggle"), input = $("#photos"), deck = $("#deck"), note = $("#note"), status = $("#status"), modeNote = $("#mode-note"), modeHelp = $("#mode-help");
let state = { mememytabEnabled: false, mememytabPhotos: [], mememytabMode: "super" };
function render() {
  const cards = state.mememytabPhotos.length ? state.mememytabPhotos : starter, faceMode = state.mememytabMode === "faces";
  toggle.textContent = state.mememytabEnabled ? "Turn off" : "Turn on"; toggle.classList.toggle("off", state.mememytabEnabled);
  note.textContent = state.mememytabPhotos.length ? `${state.mememytabPhotos.length} custom photos ready.` : "2 starter photos ready.";
  deck.innerHTML = cards.map((src, i) => `<button class="thumb" ${state.mememytabPhotos.length ? `data-x="${i}"` : "disabled"}><img src="${src}" alt="Photo ${i + 1}">${state.mememytabPhotos.length ? "×" : ""}</button>`).join("");
  modeNote.textContent = faceMode ? "subtle" : "maximum chaos";
  modeHelp.textContent = faceMode ? "Detects face boxes locally, then puts a deck photo over each detected face. No uploads or API key." : "Swaps every visible image, background, and video post with the uploaded deck.";
  document.querySelectorAll(".mode").forEach(button => { const selected = button.dataset.mode === state.mememytabMode; button.classList.toggle("selected", selected); button.setAttribute("aria-checked", selected); button.onclick = async () => { state.mememytabMode = button.dataset.mode; await save(); }; });
  document.querySelectorAll("[data-x]").forEach(button => button.onclick = async () => { state.mememytabPhotos.splice(+button.dataset.x, 1); await save(); });
}
async function tell() { const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); if (!tab?.id) return; try { await chrome.tabs.sendMessage(tab.id, { type: "MEME_MY_TAB", enabled: state.mememytabEnabled, photos: state.mememytabPhotos, mode: state.mememytabMode }); } catch { status.textContent = "Open a normal website, then try again."; } }
async function save() { await chrome.storage.local.set(state); render(); await tell(); }
function read(file) { return new Promise((resolve, reject) => { if (file.size > 3 * 1024 * 1024) return reject(`${file.name} is over 3 MB.`); const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(`Could not read ${file.name}.`); reader.readAsDataURL(file); }); }
chrome.storage.local.get(state, saved => { state = saved; if (!["faces", "super"].includes(state.mememytabMode)) state.mememytabMode = "super"; render(); });
toggle.onclick = async () => { state.mememytabEnabled = !state.mememytabEnabled; await save(); };
input.onchange = async () => { const files = [...input.files].slice(0, 5 - state.mememytabPhotos.length); try { state.mememytabPhotos.push(...await Promise.all(files.map(read))); await save(); status.textContent = "Deck loaded. Let it loose."; } catch (e) { status.textContent = e; } input.value = ""; };
