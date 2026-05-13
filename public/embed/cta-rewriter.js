/**
 * PhotoBrief CTA Rewriter
 *
 * Loaded as a third-party script tag by the Shopify, WordPress, and Wix
 * installers. Reads `?intake=...&label=...` from its own src and rewrites
 * matching CTAs in the host page.
 *
 * Idempotent: marks rewritten elements with data-pb-cta="1".
 * Self-healing: re-runs on DOMContentLoaded, then observes the DOM with a
 * MutationObserver so SPA rerenders pick up the change.
 */
(function () {
  try {
    var current = document.currentScript;
    if (!current) return;
    var src = current.getAttribute("src") || "";
    var qs = src.split("?")[1] || "";
    var params = new URLSearchParams(qs);
    var intake = params.get("intake");
    var label = (params.get("label") || "").trim().toLowerCase();
    if (!intake || !label) return;

    function rewrite(root) {
      var nodes = root.querySelectorAll('a:not([data-pb-cta]), button:not([data-pb-cta])');
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        var text = (el.innerText || el.textContent || "").trim().toLowerCase();
        if (!text) continue;
        if (text.indexOf(label) === -1 && label.indexOf(text) === -1) continue;
        if (el.tagName === "A") {
          el.setAttribute("href", intake);
          el.setAttribute("target", "_blank");
          el.setAttribute("rel", "noopener");
        } else {
          el.addEventListener("click", function (e) {
            e.preventDefault();
            window.open(intake, "_blank", "noopener");
          });
        }
        el.setAttribute("data-pb-cta", "1");
      }
    }

    function run() { rewrite(document); }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", run);
    } else {
      run();
    }
    new MutationObserver(function (muts) {
      for (var m = 0; m < muts.length; m++) {
        var added = muts[m].addedNodes;
        for (var n = 0; n < added.length; n++) {
          var node = added[n];
          if (node && node.nodeType === 1) rewrite(node);
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {
    /* swallow — never break the host page */
  }
})();
