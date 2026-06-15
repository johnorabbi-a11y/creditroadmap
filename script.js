(function () {
  const form = document.querySelector("#roadmap-form");
  const results = document.querySelector("#results");

  if (!form || !results) {
    return;
  }

  const riskLabels = ["Stable", "Needs attention", "High risk", "Very high risk"];
  const riskClasses = ["risk-stable", "risk-attention", "risk-high", "risk-very"];

  function addUnique(list, item) {
    if (!list.includes(item)) {
      list.push(item);
    }
  }

  function raiseRisk(current, next) {
    return Math.max(current, next);
  }

  function listMarkup(items) {
    if (!items.length) {
      return "<p class=\"positive-note\">No major issue flagged from this answer set. Keep checking your reports and maintaining payments on time.</p>";
    }

    return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
  }

  function buildRoadmap(data) {
    let risk = 0;
    const blockers = [];
    const quickWins = [];
    const thirtyDay = [
      "Check your statutory credit reports and confirm that names, addresses, account statuses and public records are accurate.",
      "Set reminders or direct debits for active accounts so future payments are made on time."
    ];
    const ninetyDay = [
      "Avoid unnecessary new credit applications while you stabilise your profile.",
      "Keep evidence of satisfied debts, payment plans or corrections in case a lender asks for context."
    ];
    const twelveMonth = [
      "Build a clean recent payment history and review your credit reports every few months.",
      "Only apply when the product fits your situation and you have checked eligibility where possible."
    ];
    const goalGuidance = [];

    if (data.ccjStatus === "unpaid") {
      risk = raiseRisk(risk, 3);
      addUnique(blockers, "Unpaid CCJ: lenders may treat unpaid CCJs seriously, especially for larger borrowing.");
      addUnique(thirtyDay, "If possible, review the CCJ details and consider resolving or satisfying the CCJ.");
      addUnique(ninetyDay, "If the CCJ is paid, make sure the record is updated as satisfied where appropriate.");
    }

    if (data.ccjStatus === "paid") {
      if (data.ccjAge === "under1" || data.ccjAge === "1to3") {
        risk = raiseRisk(risk, 2);
        addUnique(blockers, "Recent paid CCJ: a satisfied CCJ can still affect lending decisions until it ages off your file.");
      } else {
        risk = raiseRisk(risk, 1);
        addUnique(blockers, "Older paid CCJ: it may have less impact than a recent or unpaid CCJ, but lenders may still consider it.");
      }
      addUnique(ninetyDay, "Keep evidence that the CCJ has been paid or satisfied.");
    }

    if (data.ccjAge === "over6") {
      risk = Math.min(risk, data.ccjStatus === "unpaid" ? risk : 1);
      addUnique(quickWins, "A CCJ over 6 years old may no longer appear on standard credit files, but check your reports to confirm.");
    }

    if (data.defaults === "1") {
      risk = raiseRisk(risk, 2);
      addUnique(blockers, "One default: this can be a medium to high issue depending on age, value and whether it has been settled.");
      addUnique(ninetyDay, "If the default is accurate, focus on keeping all current accounts up to date while it ages.");
    }

    if (data.defaults === "2plus") {
      risk = raiseRisk(risk, 2);
      addUnique(blockers, "Multiple defaults: this is likely to be treated as a high issue by many lenders.");
      addUnique(twelveMonth, "Work towards resolving outstanding defaulted accounts where possible and build a longer period of clean recent conduct.");
    }

    if (data.defaults === "unsure") {
      risk = raiseRisk(risk, 1);
      addUnique(quickWins, "Check your statutory credit reports to confirm whether any defaults are recorded.");
      addUnique(thirtyDay, "Make a list of any defaulted accounts, their dates, balances and whether they are settled.");
    }

    if (data.missedPayments === "1to2") {
      risk = raiseRisk(risk, 1);
      addUnique(blockers, "Recent missed payments: 1-2 missed payments in the last 12 months need attention.");
      addUnique(thirtyDay, "Bring any accounts up to date where possible and contact providers early if payments may be missed.");
    }

    if (data.missedPayments === "3to6") {
      risk = raiseRisk(risk, 2);
      addUnique(blockers, "Several recent missed payments: this is likely to be a high issue for many lenders.");
      addUnique(ninetyDay, "Focus on three months of on-time payments before considering further applications.");
    }

    if (data.missedPayments === "6plus") {
      risk = raiseRisk(risk, 3);
      addUnique(blockers, "Frequent recent missed payments: this is a very high issue and may point to affordability pressure.");
      addUnique(thirtyDay, "Consider speaking to a qualified debt adviser if payments are becoming difficult.");
    }

    if (data.electoralRoll === "no" || data.electoralRoll === "unsure") {
      risk = raiseRisk(risk, 1);
      addUnique(quickWins, "Register on the electoral roll or confirm your address details.");
      addUnique(thirtyDay, "Check that your current address is consistent across bank accounts, credit accounts and credit reports.");
    }

    if (data.utilisation === "under25") {
      addUnique(quickWins, "Utilisation under 25% is a positive signal to maintain if affordable.");
    }

    if (data.utilisation === "25to50") {
      addUnique(quickWins, "Utilisation between 25% and 50% may be manageable, but lower balances can reduce pressure.");
    }

    if (data.utilisation === "50to75") {
      risk = raiseRisk(risk, 1);
      addUnique(blockers, "Credit utilisation between 50% and 75% needs attention.");
      addUnique(ninetyDay, "Aim to reduce revolving balances where affordable before applying for more credit.");
    }

    if (data.utilisation === "75plus") {
      risk = raiseRisk(risk, 2);
      addUnique(blockers, "High utilisation above 75% can suggest pressure on available credit.");
      addUnique(thirtyDay, "Stop adding to revolving balances where possible and plan repayments that reduce utilisation.");
      addUnique(ninetyDay, "Try to move balances down in stages before making further applications.");
    }

    if (data.applications === "1to2") {
      risk = raiseRisk(risk, 1);
      addUnique(blockers, "Recent applications: 1-2 applications in three months call for caution.");
      addUnique(ninetyDay, "Pause non-essential applications and use eligibility checks where available.");
    }

    if (data.applications === "3plus") {
      risk = raiseRisk(risk, 2);
      addUnique(blockers, "Several recent applications: 3 or more in three months may concern some lenders.");
      addUnique(thirtyDay, "Avoid new applications for a period unless they are essential.");
      addUnique(ninetyDay, "Let recent searches age and focus on stabilising the rest of your profile.");
    }

    if (data.goal === "phone") {
      addUnique(goalGuidance, "Phone contract: focus on recent missed payments, CCJs and electoral roll/address consistency before applying.");
    }

    if (data.goal === "card") {
      addUnique(goalGuidance, "Credit card: focus on utilisation, recent missed payments and the number of recent applications.");
    }

    if (data.goal === "loan") {
      addUnique(goalGuidance, "Personal loan: lenders are likely to look at affordability, defaults, CCJs and recent applications.");
    }

    if (data.goal === "car") {
      addUnique(goalGuidance, "Car finance: focus on income stability, affordability, defaults, CCJs and recent payment conduct.");
    }

    if (data.goal === "mortgage") {
      risk = raiseRisk(risk, data.ccjStatus !== "none" || data.defaults !== "0" ? 2 : risk);
      addUnique(goalGuidance, "Mortgage lenders usually look closely at CCJs, defaults, missed payments, deposit size, affordability and time since issues occurred.");
      addUnique(twelveMonth, "For a mortgage goal, build as much clean recent history as possible and consider qualified mortgage or financial advice before applying.");
    }

    if (!blockers.length && risk === 0) {
      addUnique(quickWins, "Keep balances controlled, payments on time and address details consistent.");
      addUnique(thirtyDay, "Check your reports now so you know what lenders may see.");
    }

    return {
      risk,
      blockers,
      quickWins,
      thirtyDay,
      ninetyDay,
      twelveMonth,
      goalGuidance
    };
  }

  function renderRoadmap(roadmap) {
    const riskLabel = riskLabels[roadmap.risk];
    const riskClass = riskClasses[roadmap.risk];

    results.innerHTML = `
      <div class="result-header">
        <span class="risk-pill ${riskClass}">Current profile</span>
        <h2>${riskLabel}</h2>
        <p>This is general guidance based on your answers. It does not guarantee approval, and lenders use their own criteria.</p>
      </div>
      <section class="result-section">
        <h3>Main blockers</h3>
        ${listMarkup(roadmap.blockers)}
      </section>
      <section class="result-section">
        <h3>Quick wins</h3>
        ${listMarkup(roadmap.quickWins)}
      </section>
      <section class="result-section">
        <h3>30-day plan</h3>
        ${listMarkup(roadmap.thirtyDay)}
      </section>
      <section class="result-section">
        <h3>90-day plan</h3>
        ${listMarkup(roadmap.ninetyDay)}
      </section>
      <section class="result-section">
        <h3>12-month roadmap</h3>
        ${listMarkup(roadmap.twelveMonth)}
      </section>
      <section class="result-section">
        <h3>Goal-specific guidance</h3>
        ${listMarkup(roadmap.goalGuidance)}
      </section>
      <section class="result-section">
        <h3>Reminder</h3>
        <p>Consider speaking to a qualified adviser for debt or financial advice if you are unsure what action to take.</p>
      </section>
    `;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    renderRoadmap(buildRoadmap(data));
  });

  form.addEventListener("reset", () => {
    results.innerHTML = `
      <div class="empty-state">
        <h2>Your roadmap will appear here</h2>
        <p>Complete the questionnaire to see your current profile, blockers, quick wins and staged plan.</p>
      </div>
    `;
  });
}());
