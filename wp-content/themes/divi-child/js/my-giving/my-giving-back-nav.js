(function (window, document) {
  function getHash() {
    return (window.location.hash || "").toLowerCase();
  }

  function getActiveGivingTab() {
    var active = document.querySelector(".dsm-tab.dsm-active");
    if (!active) return "";
    if (active.classList.contains("custom")) return "custom";
    if (active.classList.contains("ytd")) return "ytd";
    return "";
  }

  function isGivingPage() {
    return window.location.pathname.indexOf("/my-giving-page/") !== -1;
  }

  function isGivingTabHash(hash) {
    return hash === "#ytd" || hash === "#custom";
  }

  if (!isGivingPage()) return;

  var lastHash = getHash();
  var tabClickInProgress = false;
  var hasVisitedCustom = lastHash === "#custom" || getActiveGivingTab() === "custom";

  function normalizeTabHash(hash) {
    if (!isGivingTabHash(hash)) return;
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname + window.location.search + hash
    );
  }

  function maybeRedirectFromCustomBackToAccount(currentHash, eventType) {
    // Desired behavior: browser Back from #custom should go to account page,
    // not stop on #ytd.
    var isCustomToYtd = lastHash === "#custom" && currentHash === "#ytd";
    var isBackToYtdAfterCustom = eventType === "popstate" && hasVisitedCustom && currentHash === "#ytd";
    var shouldRedirect = isCustomToYtd || isBackToYtdAfterCustom;

    // Allow explicit tab click from custom -> ytd without redirect.
    if (shouldRedirect && !tabClickInProgress) {
      window.location.assign("/my-account-page/");
      return true;
    }
    return false;
  }

  // Track explicit tab clicks so manual tab changes do not trigger redirects.
  document.addEventListener("click", function (event) {
    var tab = event.target && event.target.closest ? event.target.closest(".dsm-tab") : null;
    if (!tab) return;
    if (!tab.classList.contains("ytd") && !tab.classList.contains("custom")) return;

    if (tab.classList.contains("custom")) {
      hasVisitedCustom = true;
    }

    tabClickInProgress = true;
    window.setTimeout(function () {
      tabClickInProgress = false;
    }, 300);
  });

  function handleHistoryEvent(event) {
    var currentHash = getHash();
    var activeTab = getActiveGivingTab();
    if (currentHash === "#custom" || activeTab === "custom") {
      hasVisitedCustom = true;
    }

    if (maybeRedirectFromCustomBackToAccount(currentHash, event && event.type)) return;
    normalizeTabHash(currentHash);
    lastHash = currentHash;
  }

  window.addEventListener("hashchange", handleHistoryEvent);
  window.addEventListener("popstate", handleHistoryEvent);

  // Initial normalization for direct tab URLs.
  normalizeTabHash(lastHash);
})(window, document);
