document.addEventListener("DOMContentLoaded", () => {
  const titles = document.querySelectorAll(".a-heading");

  titles.forEach((title) => {
    const fullText = title.textContent.trim();
    const style = getComputedStyle(title);
    const lineHeight = parseFloat(style.lineHeight);
    const maxHeight = lineHeight * 2;

    title.textContent = fullText;

    // If text already fits, skip
    if (title.scrollHeight <= maxHeight + 1) return;

    const words = fullText.split(" ");
    let truncated = "";

    // Build line by line
    for (let i = 0; i < words.length; i++) {
      title.textContent = truncated + (truncated ? " " : "") + words[i];
      if (title.scrollHeight > maxHeight + 1) {
        title.textContent = truncated.trim() + "..."; // add ellipsis here ✅
        return;
      }
      truncated = title.textContent;
    }
  });

  console.log("✅ Truncation done — '...' added when text exceeds 2 lines");
});


(() => {
  // ====== CONFIGURATION ======
  const SELECTOR = ".a-heading"; // target elements
  const MAX_LINES = 2; // number of lines allowed
  const ELLIPSIS = "..."; // what to append

  // ====== MAIN TRUNCATION FUNCTION ======
  function truncateToLines(el, maxLines = MAX_LINES) {
    if (!el) return;

    // Restore original text first (in case of re-run)
    if (!el.dataset.fullText) el.dataset.fullText = el.textContent.trim();
    const fullText = el.dataset.fullText;

    const style = getComputedStyle(el);
    const lineHeight =
      parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
    const maxHeight = lineHeight * maxLines;

    // Reset to full text for measurement
    el.textContent = fullText;

    // If it already fits in the allowed lines, stop
    if (el.scrollHeight <= maxHeight + 0.5) return;

    // ===== Binary search to find longest fitting substring =====
    let low = 0,
      high = fullText.length,
      best = "";
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const candidate = fullText.slice(0, mid).trimEnd() + ELLIPSIS;
      el.textContent = candidate;

      if (el.scrollHeight <= maxHeight + 0.5) {
        best = fullText.slice(0, mid).trimEnd();
        low = mid + 1; // try longer
      } else {
        high = mid - 1; // too tall → shorten
      }
    }

    // Prefer cutting at a space if possible
    let truncated = best;
    const lastSpace = truncated.lastIndexOf(" ");
    if (lastSpace > 0) {
      const wordCut = truncated.slice(0, lastSpace).trimEnd() + ELLIPSIS;
      el.textContent = wordCut;
      if (el.scrollHeight <= maxHeight + 0.5) return;
    }

    // Otherwise, use character cutoff
    el.textContent = truncated + ELLIPSIS;
  }

  // ===== Apply to all target elements =====
  function applyTruncation() {
    const nodes = document.querySelectorAll(SELECTOR);
    nodes.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) truncateToLines(el);
    });
  }

  // ===== Debounced resize reapply =====
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(applyTruncation, 150);
  });

  // ===== Run once after DOM is ready =====
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    applyTruncation();
  } else {
    document.addEventListener("DOMContentLoaded", applyTruncation);
  }

  console.log("✅ Robust 2-line truncation initialized for", SELECTOR);
})();

