browser.action.onClicked.addListener(async (tab) => {
    try {
        const [check] = await browser.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => typeof TurndownService !== "undefined",
        });
        if (!check.result) {
            await browser.scripting.executeScript({
                target: { tabId: tab.id },
                files: ["Readability.js", "turndown.js"],
            });
        }

        await browser.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const clone = document.cloneNode(true);
                const article = new Readability(clone).parse();
                const html = article?.content ?? document.body.innerHTML;
                const markdown = new TurndownService({
                    headingStyle: "atx",
                    bulletListMarker: "-",
                    codeBlockStyle: "fenced",
                }).turndown(html);
                return navigator.clipboard.writeText(markdown);
            },
        });

        browser.action.setIcon({
            path: "images/toolbar-icon-success.svg",
            tabId: tab.id,
        });
        setTimeout(() => {
            browser.action.setIcon({
                path: "images/toolbar-icon.svg",
                tabId: tab.id,
            });
        }, 1500);
    } catch (err) {
        console.error("page2markdown error:", err);
    }
});
