(function (global) {
  "use strict";

  const GLYPHS = "~+#%*?:/@[]|$^";
  const activeAnimations = new Set();
  const STYLE_ID = "text-ripple-styles";

  function ensureRippleStyles(doc = document) {
    if (!doc.head || doc.getElementById(STYLE_ID)) {
      return;
    }

    const style = doc.createElement("style");
    style.id = STYLE_ID;
    style.textContent = ".ripple-char{display:inline-block;white-space:pre;vertical-align:baseline;}";
    doc.head.appendChild(style);
  }

  function easeInOut(progress) {
    return 0.5 - Math.cos(progress * Math.PI) / 2;
  }

  function getTextNodes(root) {
    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || !node.nodeValue.trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        const parent = node.parentElement;
        if (!parent) {
          return NodeFilter.FILTER_REJECT;
        }

        if (["SCRIPT", "STYLE"].includes(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }

        if (parent.classList && parent.classList.contains("ripple-char")) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      }
    });

    while (walker.nextNode()) {
      nodes.push(walker.currentNode);
    }

    return nodes;
  }

  function blankText(text) {
    return text.replace(/[^\s]/g, "\u00A0");
  }

  function renderCharacter(char) {
    return /\s/.test(char) || char === "\u00A0" ? "\u00A0" : char;
  }

  function randomGlyph() {
    return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }

  function normalizeTextForSlots(node) {
    let value = node.nodeValue.replace(/\s+/g, " ");

    if (!node.previousSibling) {
      value = value.replace(/^\s+/, "");
    }

    if (!node.nextSibling) {
      value = value.replace(/\s+$/, "");
    }

    return value;
  }

  function writeFrameToSlots(slots, text) {
    for (let index = 0; index < slots.length; index += 1) {
      slots[index].textContent = renderCharacter(text[index] || "\u00A0");
    }
  }

  function buildRippleModel(element) {
    ensureRippleStyles();

    if (element._rippleModel) {
      return element._rippleModel;
    }

    const nodes = getTextNodes(element);
    const slots = [];

    for (const node of nodes) {
      const text = normalizeTextForSlots(node);

      if (!text) {
        node.nodeValue = "";
        continue;
      }

      const fragment = document.createDocumentFragment();
      const localSlots = [];

      for (const char of text) {
        const slot = document.createElement("span");
        slot.className = "ripple-char";
        slot.dataset.original = char;
        slot.dataset.whitespace = /\s/.test(char) ? "true" : "false";
        slot.textContent = renderCharacter(char);
        fragment.appendChild(slot);
        localSlots.push(slot);
      }

      node.parentNode.replaceChild(fragment, node);
      slots.push(...localSlots);
    }

    for (const slot of slots) {
      const measuredWidth = slot.getBoundingClientRect().width;
      const fallbackWidth = slot.dataset.whitespace === "true" ? 4 : 1;
      slot.style.width = `${Math.max(measuredWidth, fallbackWidth)}px`;
    }

    const originalText = slots.map((slot) => slot.dataset.original).join("");
    const blankedText = blankText(originalText);
    const model = { slots, originalText, blankedText };
    element._rippleModel = model;
    return model;
  }

  function scrambleReveal(element, options = {}) {
    const model = buildRippleModel(element);
    const { slots, originalText, blankedText } = model;

    if (!slots.length) {
      return Promise.resolve();
    }

    const duration = options.duration ?? 1800;
    const delay = options.delay ?? 0;
    const spread = Math.max(Math.floor(originalText.length * 1.45), 18);
    let scrambledText = blankedText;

    writeFrameToSlots(slots, blankedText);

    return new Promise((resolve) => {
      const animation = { cancelled: false };
      activeAnimations.add(animation);

      const start = performance.now() + delay;

      function tick(now) {
        if (animation.cancelled) {
          activeAnimations.delete(animation);
          writeFrameToSlots(slots, originalText);
          resolve();
          return;
        }

        if (now < start) {
          requestAnimationFrame(tick);
          return;
        }

        const rawProgress = Math.min((now - start) / duration, 1);
        const eased = Math.pow(easeInOut(rawProgress), 2);
        const head = Math.floor(originalText.length * eased);
        const windowSize = Math.floor((1 - Math.abs(rawProgress - 0.5) * 2) * spread);
        const lead = originalText.slice(0, head);
        const tailStart = Math.min(head + windowSize, originalText.length);
        let frame = lead + scrambledText.slice(head, tailStart) + blankedText.slice(tailStart);

        if (rawProgress > 0 && rawProgress < 1) {
          const mutations = Math.max(24, Math.floor(windowSize * 0.85));

          for (let index = 0; index < mutations; index += 1) {
            const target = head + Math.floor(Math.random() * Math.max(windowSize, 1));
            if (target < 0 || target >= originalText.length || /\s/.test(originalText[target])) {
              continue;
            }

            const distanceThroughBand = windowSize <= 1 ? 0 : (target - head) / windowSize;
            const resolveBias = Math.max(0.18, 0.72 - distanceThroughBand * 0.45);
            const useOriginal = Math.random() < resolveBias;
            const nextChar = useOriginal ? originalText[target] : randomGlyph();
            frame = frame.slice(0, target) + nextChar + frame.slice(target + 1);
            scrambledText = scrambledText.slice(0, target) + nextChar + scrambledText.slice(target + 1);
          }
        }

        writeFrameToSlots(slots, frame);

        if (rawProgress < 1) {
          requestAnimationFrame(tick);
          return;
        }

        activeAnimations.delete(animation);
        writeFrameToSlots(slots, originalText);
        resolve();
      }

      requestAnimationFrame(tick);
    });
  }

  function cancelAnimations() {
    for (const animation of activeAnimations) {
      animation.cancelled = true;
    }
  }

  function runRipple(speedMultiplier = 1, root = document) {
    cancelAnimations();
    ensureRippleStyles(root);

    const targets = Array.from(root.querySelectorAll("[data-ripple]"));

    return Promise.all(targets.map((element, index) => {
      const baseDuration = Number(element.dataset.duration || 1800);
      const baseDelay = Number(element.dataset.delay || index * 100);

      return scrambleReveal(element, {
        duration: baseDuration * speedMultiplier,
        delay: baseDelay * speedMultiplier
      });
    }));
  }

  global.TextRipple = {
    GLYPHS,
    activeAnimations,
    ensureRippleStyles,
    easeInOut,
    getTextNodes,
    blankText,
    renderCharacter,
    randomGlyph,
    normalizeTextForSlots,
    writeFrameToSlots,
    buildRippleModel,
    scrambleReveal,
    cancelAnimations,
    runRipple
  };
})(window);
