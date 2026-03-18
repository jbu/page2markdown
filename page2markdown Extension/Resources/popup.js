document.getElementById("convert").addEventListener("click", async () => {
    const status = document.getElementById("status");
    try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

        // Inject libraries only if not already present (handles repeated clicks)
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

        // Run conversion and return markdown string
        const [result] = await browser.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const clone = document.cloneNode(true);
                const article = new Readability(clone).parse();
                const html = article?.content ?? document.body.innerHTML;
                return new TurndownService({
                    headingStyle: "atx",
                    bulletListMarker: "-",
                    codeBlockStyle: "fenced",
                }).turndown(html);
            },
        });

        await navigator.clipboard.writeText(result.result);
        await browser.runtime.sendMessage({ action: "flash", tabId: tab.id });
        status.textContent = "Copied!";
    } catch (err) {
        status.textContent = "Error: " + err.message;
    }
});
