<p align="center">
  <img src="image-replacer-extension/assets/icon.png" width="92" alt="MemeMyTab icon">
</p>

<h1 align="center">MemeMyTab</h1>

<p align="center"><strong>Give the internet one main character.</strong><br>Because your group chat deserves browser-level commitment.</p>

<p align="center">
  <a href="https://github.com/chotushikari/mememytab/raw/refs/heads/main/downloads/MemeMyTab-v8.zip"><img src="https://img.shields.io/badge/Download-v2.4.0-a9ff65?style=for-the-badge&labelColor=111218" alt="Download MemeMyTab"></a>
  <img src="https://img.shields.io/badge/100%25-local-ff5f8f?style=for-the-badge&labelColor=111218" alt="100 percent local">
  <img src="https://img.shields.io/badge/tracking-none-7c8cff?style=for-the-badge&labelColor=111218" alt="No tracking">
</p>

> Upload your friend. Open Google, X, or any suspiciously serious website. Let chaos handle the rest.

## Install in 30 seconds

1. [Download MemeMyTab v2.4.0](https://github.com/chotushikari/mememytab/raw/refs/heads/main/downloads/MemeMyTab-v8.zip).
2. Extract the ZIP somewhere permanent.
3. Visit `chrome://extensions` → turn on **Developer mode** → **Load unpacked**.
4. Choose the extracted `image-replacer-extension` folder.
5. Open the extension, build a photo deck, and press **Turn on**.

That’s it. Your browser has joined the bit.

## Pick your flavour of unreasonable

| Mode | What happens |
| --- | --- |
| **Face mode** | Chrome detects local face boxes and puts your deck photo over detected faces. Icons, logos, and random tiny UI are left alone. |
| **Super mode** | Every visible image, background, and video post gets replaced by the selected photo deck. Maximum nonsense. |

Face mode uses Chrome’s built-in experimental `FaceDetector`. If Chrome does not expose it, enable **Experimental Web Platform features** at `chrome://flags/#enable-experimental-web-platform-features`, then relaunch.

## The plot

| Make the deck | Release the deck |
| :-: | :-: |
| <img src="docs/user-journey/Screenshot%202026-09-16%20161657.png" alt="Build a MemeMyTab photo deck" width="310"> | <img src="docs/user-journey/Screenshot%202026-09-16%20161711.png" alt="Turn MemeMyTab on" width="310"> |

| Normal search results | The same search results, but now personal |
| :-: | :-: |
| <img src="docs/user-journey/Screenshot%202026-09-16%20161743.png" alt="MemeMyTab turns image search into an inside joke" width="440"> | <img src="docs/user-journey/Screenshot%202026-09-16%20161818.png" alt="MemeMyTab replaces small images too" width="440"> |

## How the magic is held together

No paid AI. No server. No background worker. No tracking.

- Your deck lives in Chrome’s local storage.
- Images are preloaded before replacement, so the reveal stays clean.
- Lazy-loaded images are watched as they arrive—very important for Google and X.
- Face mode uses the browser’s local detector; Super mode is unapologetically direct.

It is a prank extension, not a surveillance machine. Use photos you have permission to use. Be funny, not awful.

## Credit where the chaos began

Inspired by [LeReplacerExtension](https://github.com/ShreyShingala/LeReplacerExtension), rebuilt as a minimal, local-first photo-deck version.

## Say hi / send memes

<a href="https://www.linkedin.com/in/piyushtakrani2805"><img alt="LinkedIn" src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white"></a>
<a href="mailto:air1piyushtakrani@gmail.com"><img alt="Email" src="https://img.shields.io/badge/Gmail-EA4335?style=for-the-badge&logo=gmail&logoColor=white"></a>
<a href="https://github.com/chotushikari"><img alt="GitHub" src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white"></a>
