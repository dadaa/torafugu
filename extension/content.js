"use strict";

(() => {
  if (window._installed) {
    return;
  }
  window._installed = true;

  const eventTargets = new Set();

  browser.runtime.onMessage.addListener(({ targetElementId }) => {
    if (eventTargets.has(targetElementId)) {
      return;
    }

    const editable = browser.menus.getTargetElement(targetElementId);
    const panel = document.createElement("div");
    panel.style.fontSize = "11px";
    panel.style.fontWeight = 400;
    panel.style.padding = "4px";
    panel.style.borderRadius = "2px";
    panel.style.color = "#0c0c0d";
    panel.style.backgroundColor = "#f9f9fa";
    panel.style.border = "1px solid #e0e0e2";
    panel.style.position = "absolute";
    panel.style.zIndex = Number.MAX_VALUE;
    panel.style.display = "none";
    document.body.appendChild(panel);

    let timerID = null;
    let positionX = 0;
    let positionY = 0;

    editable.addEventListener("input", () => {
      // We don't have to remove this listener since this script also is
      // destroyed at same time when the document is destroyed.

      clearTimeout(timerID);

      timerID = setTimeout(async () => {
        const { selectionStart: caretPosition, value } = editable;

        let setenseStart = caretPosition - 1;
        for (; setenseStart >= 0; setenseStart--) {
          const currentChar = value.charAt(setenseStart);
          if (currentChar === "." || currentChar === "?" || currentChar === "!") {
            const nextChar = value.charAt(setenseStart + 1);
            if (nextChar === " " || nextChar === "\n") {
              setenseStart += 2;
              break;
            }
          }
        }

        let setenseEnd = caretPosition;
        for (; setenseEnd < value.length; setenseEnd++) {
          const currentChar = value.charAt(setenseEnd);
          if (currentChar === "." || currentChar === "?" || currentChar === "!") {
            const nextChar = value.charAt(setenseEnd + 1);
            if (nextChar === " " || nextChar === "\n") {
              break;
            }
          }
        }

        const sentence = value.substring(setenseStart, setenseEnd);
        const url = "https://translate.googleapis.com/translate_a/single" +
                    "?client=gtx&sl=en&tl=jp&dt=t&q=" + encodeURI(sentence);
        const response = await fetch(url);
        const json = await response.json();
        const result = json[0][0][0];

        panel.textContent = result;
        panel.style.left = `${ positionX }px`;
        panel.style.top = `calc(${ positionY }px + 0.5em)`;
        panel.style.display = "unset";
      }, 1000);
    });

    editable.addEventListener("mousemove", e => {
      positionX = e.pageX;
      positionY = e.pageY;
    });

    editable.addEventListener("click", e => {
      if (e.target !== panel) {
        panel.style.display = "none";
      }
    });

    eventTargets.add(targetElementId);
  });
})();
