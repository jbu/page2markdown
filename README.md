# page2markdown

A Safari extension for macOS that converts the current page to Markdown and copies it to the clipboard.

Click the toolbar icon — the page is converted using [Readability](https://github.com/mozilla/readability) (article extraction) and [Turndown](https://github.com/mixmark-io/turndown) (HTML→Markdown). The icon briefly turns green to confirm the copy succeeded.

## Requirements

- macOS
- Xcode
- Safari

## Build & install

```sh
open page2markdown.xcodeproj
```

Build and run with ⌘R. Then enable the extension in Safari → Settings → Extensions.

## How it works

- No scripts are injected until you click the icon
- On click, `background.js` uses `browser.scripting.executeScript` to inject Readability and Turndown into the active tab, runs the conversion, and writes the result to the clipboard — all in one action
- The toolbar icon flashes green for 1.5 s on success

## Project structure

```
page2markdown/                  Companion app (required by Safari to host the extension)
page2markdown Extension/
  Resources/
    background.js               Handles toolbar click, injection, conversion, icon flash
    Readability.js              Mozilla Readability (article extraction)
    turndown.js                 Turndown (HTML → Markdown)
    manifest.json               Extension manifest (MV3)
    images/
      toolbar-icon.svg          Default toolbar icon
      toolbar-icon-success.svg  Green checkmark shown briefly after copy
```
