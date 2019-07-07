"use strict";

browser.menus.create({
  id: "torafugu",
  title: "Edit while translating",
  contexts: ["editable"]
});

browser.menus.onClicked.addListener(async (info, tab) => {
  const { frameId, targetElementId } = info;

  await browser.tabs.executeScript(tab.id, {
    runAt: "document_idle",
    frameId,
    file: "content.js",
  });

  browser.tabs.sendMessage(tab.id, { targetElementId }, { frameId });
});
