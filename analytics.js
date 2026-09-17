"use strict";

(function () {
  const allowedParams = new Set(["goal", "risk_band", "tool_name", "source_page", "link_context"]);
  const firedOnce = new Set();

  function pageName() {
    const page = window.location.pathname.split("/").filter(Boolean).pop();
    return page || "index.html";
  }

  function cleanValue(value) {
    if (value == null) return undefined;
    return String(value).trim().slice(0, 80).replace(/[^a-zA-Z0-9_ .-]/g, "");
  }

  function cleanParams(params) {
    const output = {};
    Object.entries(params || {}).forEach(([key, value]) => {
      if (!allowedParams.has(key)) return;
      const cleaned = cleanValue(value);
      if (cleaned) output[key] = cleaned;
    });
    return output;
  }

  function track(eventName, params) {
    const name = cleanValue(eventName);
    if (!name) return;
    const payload = cleanParams(params);
    if (typeof window.gtag === "function") {
      window.gtag("event", name, payload);
      return;
    }
    window.creditRoadmapAnalyticsQueue = window.creditRoadmapAnalyticsQueue || [];
    window.creditRoadmapAnalyticsQueue.push({
      event: name,
      params: payload,
      timestamp: new Date().toISOString()
    });
    window.dispatchEvent(new CustomEvent("creditroadmap:analytics", {
      detail: { event: name, params: payload }
    }));
  }

  function trackOnce(key, eventName, params) {
    if (firedOnce.has(key)) return;
    firedOnce.add(key);
    track(eventName, params);
  }

  function closestTrackedLink(target) {
    return target && target.closest ? target.closest("a, button, [data-track-event]") : null;
  }

  function linkContext(link) {
    return link.dataset.trackContext || link.dataset.trackLinkContext || link.dataset.trackTool || link.closest(".related-tool-box") && "related_tool_box" || link.closest("#credit-help-centres") && "homepage_ecosystem" || link.closest(".resource-cta") && "contextual_article_link" || link.closest(".hub-link-grid") && "hub_navigation" || "contextual_article_link";
  }

  document.addEventListener("DOMContentLoaded", function () {
    const tool = document.querySelector("[data-calculator-tool]");
    if (tool) {
      trackOnce("calculator_view:" + tool.dataset.calculatorTool, "calculator_view", {
        tool_name: tool.dataset.calculatorTool
      });
    }

    const roadmapForm = document.querySelector("#roadmap-form");
    if (roadmapForm) {
      ["input", "change", "focusin"].forEach((type) => {
        roadmapForm.addEventListener(type, function () {
          const goalField = roadmapForm.elements.goal;
          trackOnce("roadmap_started", "roadmap_started", {
            goal: goalField ? goalField.value : undefined
          });
        }, { once: true });
      });
    }
  });

  document.addEventListener("click", function (event) {
    const target = closestTrackedLink(event.target);
    if (!target) return;

    if (target.dataset && target.dataset.trackEvent) {
      track(target.dataset.trackEvent, {
        tool_name: target.dataset.trackTool,
        link_context: target.dataset.trackContext || target.dataset.trackLinkContext,
        source_page: pageName()
      });
      return;
    }

    if (target.matches("a[href*='salarydecoded.com']")) {
      track("cross_site_salarydecoded_click", {
        source_page: pageName(),
        link_context: linkContext(target)
      });
      return;
    }

    if (target.matches("a[href='roadmap.html'], a[href$='/roadmap.html']")) {
      if (pageName() !== "roadmap.html") {
        const context = target.dataset.trackContext || target.closest(".calculator-results") && "roadmap_cta_click" || "content_to_roadmap";
        track(context === "roadmap_cta_click" ? "roadmap_cta_click" : "guide_to_roadmap_click", {
          source_page: pageName(),
          link_context: context
        });
      }
      return;
    }

    if (target.matches(".hub-page .hub-link-card[href$='.html'], .hub-page .reading-card[href$='.html']")) {
      track("hub_to_article_click", {
        source_page: pageName(),
        link_context: "hub_navigation"
      });
    }
  });

  window.CreditRoadmapAnalytics = {
    track,
    trackOnce
  };
}());
