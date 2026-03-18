# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`page2markdown` is a macOS Safari Web Extension (Manifest V3) that converts web pages to Markdown and copies them to the clipboard. It is built with Xcode and consists of two targets:

- **macOS companion app** (`page2markdown/`): A minimal app required by Safari to host the extension. Shows extension enable/disable status via a `WKWebView` that loads `Main.html`.
- **Safari extension** (`page2markdown Extension/`): The actual browser extension (JS + Swift native handler).

## Building

Open `page2markdown.xcodeproj` in Xcode and build/run with ⌘R, or via command line:

```sh
xcodebuild -project page2markdown.xcodeproj -scheme page2markdown -configuration Debug build
```

To run tests:
```sh
xcodebuild -project page2markdown.xcodeproj -scheme page2markdown -destination 'platform=macOS' test
```

The extension must be enabled in Safari → Settings → Extensions after first launch of the companion app.

After rebuilding, quit Safari completely (⌘Q) and relaunch it to pick up extension changes.

## Architecture

### How it works

Clicking the toolbar icon triggers `browser.action.onClicked` in `background.js` (no popup). The background script uses `browser.scripting.executeScript` to lazily inject `Readability.js` and `turndown.js` into the active tab (skipped if already present), runs the conversion inline, writes the result to the clipboard via the page context, then flashes the toolbar icon green for 1.5 s.

### Communication flows

- **JS → Swift (native messaging)**: `browser.runtime.sendNativeMessage(...)` in JS → `SafariWebExtensionHandler.beginRequest(with:)` in Swift. The handler currently echoes messages back.
- **Companion app ↔ WKWebView**: `ViewController` calls `webView.evaluateJavaScript("show(...)")` to update state; the HTML/JS calls back via `webkit.messageHandlers.controller.postMessage("open-preferences")`.

### Key files

| File | Purpose |
|---|---|
| `page2markdown Extension/Resources/background.js` | Handles toolbar click, lazy script injection, conversion, clipboard write, icon flash |
| `page2markdown Extension/Resources/Readability.js` | Mozilla Readability — extracts article content from the page |
| `page2markdown Extension/Resources/turndown.js` | Converts HTML to Markdown |
| `page2markdown Extension/Resources/manifest.json` | MV3 manifest — no popup, permissions: `activeTab`, `clipboardWrite`, `tabs`, `scripting` |
| `page2markdown Extension/Resources/images/toolbar-icon.svg` | Default toolbar icon |
| `page2markdown Extension/Resources/images/toolbar-icon-success.svg` | Green checkmark icon shown briefly after a successful copy |
| `page2markdown Extension/SafariWebExtensionHandler.swift` | Swift bridge for native messaging from JS |
| `page2markdown/ViewController.swift` | Companion app; checks extension state via `SFSafariExtensionManager` |
| `page2markdown/Resources/Base.lproj/Main.html` + `Script.js` | Companion app webview UI |

### Extension bundle identifier

`uk.uther.page2markdown.Extension` (defined in `ViewController.swift` and referenced in the app target's entitlements).

### manifest.json notes

- Manifest V3 with `"type": "module"` background script.
- No `content_scripts` — libraries are injected on demand via `scripting.executeScript`.
- No `default_popup` — click is handled by `browser.action.onClicked` in `background.js`.
- Permissions: `activeTab`, `clipboardWrite`, `tabs`, `scripting`.

## Testing

Unit tests use Swift Testing (`import Testing`, `@Test` functions). UI tests use XCTest. Both test targets are placeholders with no real tests yet.
