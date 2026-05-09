---
title: "Build Your First Chrome Extension: A Step-by-Step Guide"
description: "Learn to build a real Chrome extension from scratch—covering manifest.json, popup UI, content scripts, background service workers, and publishing to the Chrome Web Store."
date: 2026-10-08T10:00:00-04:00
tags: ["javascript", "chrome extension", "web development", "browser", "tutorial"]
categories: ["JavaScript", "Web Development"]
draft: false
slug: "build-chrome-extension"
seoKeywords:
  - build Chrome extension tutorial
  - Chrome extension beginner guide
  - manifest.json Chrome extension
  - content scripts Chrome
  - popup Chrome extension JavaScript
  - publish Chrome extension
canonicalUrl: "https://missquibble.com/posts/build-chrome-extension/"
---

#### ***Introduction***

Chrome extensions are one of the most satisfying things to build as a JavaScript developer. You start with a plain HTML, CSS, and JS project — no framework, no build tool required — and end up with a real piece of software that changes how the browser behaves. Extensions can modify web pages, intercept network requests, inject UI elements, sync data across devices, and surface information instantly from the toolbar. This guide builds a real extension — a reading time estimator that shows estimated reading time for any article — from a blank folder to a working installed extension.

# How Chrome Extensions Work

A Chrome extension is a bundle of web files with a special configuration file (`manifest.json`) that tells Chrome what the extension does and what permissions it needs.

The key components:

- **manifest.json** — the required configuration file. Defines permissions, files, icons, and entry points.
- **Popup** — a small HTML page that appears when you click the extension icon in the toolbar.
- **Content Scripts** — JavaScript that runs in the context of web pages. Can read and modify the DOM.
- **Background Service Worker** — runs in the background independently of any web page. Handles events, manages state.
- **Options Page** — a full page for user configuration.

Not every extension needs all of these. Our reading time estimator needs a popup and a content script.

# Project Structure

```
reading-time-extension/
├── manifest.json
├── popup.html
├── popup.js
├── popup.css
├── content.js
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

Create this folder structure. For icons, you can generate simple PNGs in any image editor or use placeholder files initially.

# manifest.json

```json
{
  "manifest_version": 3,
  "name": "Reading Time Estimator",
  "version": "1.0",
  "description": "Instantly see the estimated reading time for any article.",

  "permissions": ["activeTab", "scripting"],

  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },

  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ],

  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}
```

Manifest V3 is the current standard. Always use it for new extensions — V2 is being deprecated.

`"permissions": ["activeTab", "scripting"]` — we request only what we need. Always request minimum permissions.

# content.js — Reading the Page

Content scripts run in the context of every web page that matches the `matches` pattern. Ours extracts the article text and calculates reading time:

```javascript
// content.js
function estimateReadingTime() {
  // Try to find main article content
  const selectors = ["article", "main", ".post-content", ".entry-content", "#content", "body"];
  let text = "";

  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el) {
      text = el.innerText;
      break;
    }
  }

  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const minutes = Math.ceil(words / 238); // average reading speed

  return { words, minutes };
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getReadingTime") {
    sendResponse(estimateReadingTime());
  }
});
```

# popup.html

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="container">
    <h1>📖 Reading Time</h1>
    <div id="result">
      <div class="stat">
        <span class="value" id="minutes">—</span>
        <span class="label">min read</span>
      </div>
      <div class="stat">
        <span class="value" id="words">—</span>
        <span class="label">words</span>
      </div>
    </div>
    <div id="error" class="hidden">Could not analyze this page.</div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
```

# popup.js

```javascript
// popup.js
async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function init() {
  const tab = await getActiveTab();

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: "getReadingTime" });
    document.getElementById("minutes").textContent = response.minutes;
    document.getElementById("words").textContent = response.words.toLocaleString();
  } catch (error) {
    document.getElementById("result").classList.add("hidden");
    document.getElementById("error").classList.remove("hidden");
  }
}

document.addEventListener("DOMContentLoaded", init);
```

# popup.css

```css
body { margin: 0; font-family: 'Segoe UI', sans-serif; min-width: 200px; }
.container { padding: 20px; background: #1e1e2e; color: #cdd6f4; }
h1 { font-size: 16px; margin: 0 0 16px; }
#result { display: flex; gap: 24px; justify-content: center; }
.stat { text-align: center; }
.value { display: block; font-size: 36px; font-weight: 700; color: #89b4fa; }
.label { font-size: 12px; color: #6c7086; }
.hidden { display: none; }
#error { text-align: center; color: #f38ba8; font-size: 14px; }
```

# Installing Your Extension

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked** and select your extension folder
4. The extension icon appears in the toolbar — click it on any article page

Every time you change a file, click the refresh icon on your extension card in `chrome://extensions` to reload it.

# Publishing to the Chrome Web Store

When your extension is ready to share:

1. Zip your extension folder (not the folder itself, the files inside it)
2. Create a developer account at chrome.google.com/webstore/devconsole (one-time $5 registration fee)
3. Upload your ZIP, add screenshots, description, and privacy policy
4. Submit for review — typically approved within a few days

# Ideas for Your Next Extension

- **Focus Mode** — hide social media feeds on specific sites
- **Color Picker** — click anywhere on a page to copy its hex color
- **Tab Saver** — save all open tabs to a list you can restore later
- **Custom Dark Mode** — inject a dark stylesheet into any website
- **GitHub Enhancements** — add features to GitHub that the site does not have natively

# Conclusion

Chrome extensions unlock a category of software that web developers are uniquely positioned to build. Your existing HTML, CSS, and JavaScript skills transfer directly — the only new concepts are the extension APIs. Build something that solves a problem you actually have, install it for yourself, and use it daily. That is how the best extensions get made.
